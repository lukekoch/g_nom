from genericpath import exists
from json import loads
from uuid import uuid1
from os import listdir
from os.path import basename, isdir, join, dirname, getsize
from re import compile
from sys import argv
from datetime import datetime
from .db_connection import connect

from modules.environment import BASE_PATH_TO_IMPORT
from modules.assemblies import (
    deleteAssemblyByAssemblyID,
    import_assembly,
    FASTA_FILE_PATTERN,
)
from modules.annotations import ANNOTATION_FILE_PATTERN, import_annotation
from modules.mappings import import_mapping
from modules.notifications import createNotification
from modules.analyses import import_analyses
from modules.tasks import addTask, isTaxonCurrentlyEdited, updateTask
from .producer import notify_worker
from modules.taxa import fetchTaxonByNCBITaxonID, fetchTaxonByTaxonID

FILE_PATTERN_DICT = {
    "image": {
        "main_file": compile(r"^(.*\.jpg$)|(.*\.jpeg$)|(.*\.png$)|(.*\.jfif$)"),
        "default_parent_dir": None,
        "additional_files": [],
    },
    "sequence": FASTA_FILE_PATTERN,
    "annotation": ANNOTATION_FILE_PATTERN,
    "mapping": {
        "main_file": compile(r"^(.*\.bam$)|(.*\.bam\.gz$)"),
        "default_parent_dir": None,
        "additional_files": [],
    },
    "taxaminer": {
        "main_file": compile(r"^(.*\.zip$)"),
        "default_parent_dir": None,
        "additional_files": [],
    },
    "busco": {
        "main_file": compile(r"^(.*short_summary.*\.txt$)"),
        "default_parent_dir": compile(r"^(.*run_.*$)"),
        "additional_files": [
            compile(r"^.*full_table.*\.tsv$"),
            compile(r"^.*missing(_busco_list)?.*\.tsv$"),
            compile(r"^.*busco_sequences.*$"),
            compile(r"^.*hmmer_output.*$"),
        ],
    },
    "fcat": {
        "main_file": compile(r"^(.*report_summary.*\.txt$)"),
        "default_parent_dir": compile(r"^(.*\w+@\d+@.*$)"),
        "additional_files": [
            compile(r"^.*ignored.*\.txt$"),
            compile(r"^.*missing.*\.txt$"),
            compile(r"^.*report_dismiss.*\.txt$"),
            compile(r"^.*last_refspec.*\.txt$"),
            compile(r"^.*report_full.*\.txt$"),
            compile(r"^.*genome_dir.*$"),
            compile(r"^.*phyloprofileOutput.*$"),
        ],
    },
    "repeatmasker": {
        "main_file": compile(r"^.*\.tbl$"),
        "default_parent_dir": None,
        "additional_files": [compile(r"^(.*\.align$)"), compile(r"^(.*\.out$)")],
    },
}

MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST = 5


# FETCH IMPORT DIRECTORY IN JSON FORMAT
def fetchImportDirectory(path=BASE_PATH_TO_IMPORT):
    """
    Generates file tree of the import directory!
    """

    def pathToJson(path):
        relative_path = path[len(BASE_PATH_TO_IMPORT) :]

        path_info = {
            "id": uuid1(),
            "name": basename(path),
            "path": relative_path,
        }

        if isdir(path):
            for t in FILE_PATTERN_DICT:
                if FILE_PATTERN_DICT[t]["default_parent_dir"]:
                    if FILE_PATTERN_DICT[t]["default_parent_dir"].match(path_info["name"]):
                        path_info.update({"dirType": t})
                        break

                if len(FILE_PATTERN_DICT[t]["additional_files"]):
                    for af in FILE_PATTERN_DICT[t]["additional_files"]:
                        if af.match(path_info["name"]):
                            path_info.update({"additionalFilesType": t})
                            break

            path_info["children"] = [pathToJson(join(path, x)) for x in listdir(path)]

        else:
            for t in FILE_PATTERN_DICT:
                if FILE_PATTERN_DICT[t]["main_file"].match(path_info["name"]):
                    path_info.update({"type": t, "size": getsize(path) // 1000000})
                    break

                if len(FILE_PATTERN_DICT[t]["additional_files"]):
                    for af in FILE_PATTERN_DICT[t]["additional_files"]:
                        if af.match(path_info["name"]):
                            path_info.update({"additionalFilesType": t})
                            break

        return path_info

    if path[-1] == "/":
        path = path[:-1]

    return pathToJson(path), {}


def __getSupportedFiles(file_info, type):
    if type not in FILE_PATTERN_DICT:
        return [], []

    if FILE_PATTERN_DICT[type]["main_file"].match(file_info["name"]):
        return [file_info], []

    if len(FILE_PATTERN_DICT[type]["additional_files"]):
        for af in FILE_PATTERN_DICT[type]["additional_files"]:
            if af.match(file_info["name"]):
                return [], [file_info]

    if "children" in file_info:
        child_main_files, child_additional_files = [], []
        for x in file_info["children"]:
            new_child_main_files, new_child_additional_files = __getSupportedFiles(x, type)
            child_main_files += new_child_main_files
            child_additional_files += new_child_additional_files
        return child_main_files, child_additional_files

    return [], []


def validateFileInfo(file_info, forceType=""):
    """
    Validates files for import!
    """
    datasets = {}
    if not forceType or forceType not in FILE_PATTERN_DICT:
        for type in FILE_PATTERN_DICT:
            main_files, additional_files = __getSupportedFiles(file_info, type)
            if len(main_files) > 0:
                subsets = []
                paths = {}
                for file in main_files:
                    dir = dirname(file["path"])
                    if dir not in paths:
                        paths.update({dir: 1})
                    else:
                        paths[dir] += 1
                    subsets.append({"main_file": file, "additional_files": additional_files})
                datasets[type] = [
                    x
                    for x in subsets
                    if paths[dirname(x["main_file"]["path"])] < MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST
                ]

    else:
        main_files, additional_files = __getSupportedFiles(file_info, forceType)
        if len(main_files):
            subsets = []
            paths = []
            for file in main_files:
                dir = dirname(file["path"])
                if dir not in paths:
                    paths.update({dir: 1})
                else:
                    paths[dir] += 1
                subsets.append({"main_file": file, "additional_files": additional_files})
            datasets[forceType] = [
                x
                for x in subsets
                if paths[dirname(x["main_file"]["path"])] < MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST
            ].sort(key=lambda d: d["name"])

    if len(datasets) <= 0:
        return {}, createNotification("Info", "No valid dataset detetcted!", "info")

    return datasets, createNotification("Success", "At least one valid dataset detetcted!", "success")


def import_dataset_with_queue(
    taxon,
    assembly,
    userID,
    annotations=[],
    mappings=[],
    buscos=[],
    fcats=[],
    taxaminers=[],
    repeatmaskers=[],
    append_assembly_id=0,
):
    try:
        taskID = str(uuid1())

        currently_edited = isTaxonCurrentlyEdited(taxon["id"])
        if currently_edited:
            return {
                "id": taskID,
                "status": "aborted",
                "startTime": datetime.now(),
            }, createNotification("Error", "Import not started. Taxon is currently edited!", "error")

        addTask(taskID, taxon["id"])

        notify_worker(
            "Import",
            "Dataset",
            {
                "taxon": taxon,
                "assembly": assembly,
                "userID": userID,
                "annotations": annotations,
                "mappings": mappings,
                "buscos": buscos,
                "fcats": fcats,
                "taxaminers": taxaminers,
                "repeatmaskers": repeatmaskers,
                "append_assembly_id": append_assembly_id,
            },
            taskID,
        )

        return {"id": taskID, "status": "running", "startTime": datetime.now(),}, createNotification(
            "Success",
            "Import started. You will be notified when it finished!",
            "success",
        )

    except Exception as err:
        return {
            "id": "",
            "status": "aborted",
            "startTime": datetime.now(),
        }, createNotification(message=f"StartImportError: {str(err)}")


# import for all possible data
def importDataset(
    taxon,
    assembly,
    userID,
    annotations=[],
    mappings=[],
    buscos=[],
    fcats=[],
    taxaminers=[],
    repeatmaskers=[],
    append_assembly_id=0,
    taskID="",
):
    """
    Imports assembly with all supported datasets (annotations, mappings, Busco, fCat, taXaminer, Repeatmasker)
    """
    summary = {
        "assemblyID": None,
        "annotationIDs": [],
        "mappingIDs": [],
        "buscoIDs": [],
        "fcatIDs": [],
        "taxaminerIDs": [],
        "repeatmaskerIDs": [],
    }
    notifications = []
    process = 0

    if not taxon:
        return summary, createNotification(message="Missing taxon information!")

    if not assembly and not append_assembly_id:
        return summary, createNotification(message="Missing assembly!")

    if not userID:
        return summary, createNotification(message="Missing user information!")

    if not append_assembly_id:
        assembly_id = None
        try:
            if len(assembly) != 1:
                return summary, createNotification(message="Exact one assembly needs to be supplied!")

            assembly = assembly[0]
            assembly_id, notification = import_assembly(taxon, assembly, userID, taskID)


            if not assembly_id:
                return summary, notification
            summary["assemblyID"] = assembly_id
        except Exception as err:
            if assembly_id:
                deleteAssemblyByAssemblyID(assembly_id)
            return summary, createNotification(message=f"CombinedImportError1: {str(err)}!")
    else:
        assembly_id = append_assembly_id

    try:
        if taskID:
            progress = 30
            updateTask(taskID, "running", progress)
    except:
        pass

    try:
        for idx, annotation in enumerate(annotations):
            annotation_id, notification = import_annotation(taxon, assembly_id, annotation, userID)
            if annotation_id:
                summary["annotationIDs"] += [annotation_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 20 // len(annotations)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 50
                updateTask(taskID, "running", progress)
        except:
            pass

        for mapping in mappings:
            mapping_id, notification = import_mapping(taxon, assembly_id, mapping, userID)
            if mapping_id:
                summary["mappingIDs"] += [mapping_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(mappings)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 60
                updateTask(taskID, "running", progress)
        except:
            pass

        for busco in buscos:
            busco_id, notification = import_analyses(taxon, assembly_id, busco, "busco", userID)
            if busco_id:
                summary["buscoIDs"] += [busco_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 20 // len(buscos)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 70
                updateTask(taskID, "running", progress)
        except:
            pass

        for fcat in fcats:
            fcat_id, notification = import_analyses(taxon, assembly_id, fcat, "fcat", userID)
            if fcat_id:
                summary["fcatIDs"] += [fcat_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(fcats)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 80
                updateTask(taskID, "running", progress)
        except:
            pass

        for taxaminer in taxaminers:
            taxaminer_id, notification = import_analyses(taxon, assembly_id, taxaminer, "taxaminer", userID)
            if taxaminer_id:
                summary["taxaminerIDs"] += [taxaminer_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(taxaminers)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 90
                updateTask(taskID, "running", progress)
        except:
            pass

        for repeatmasker in repeatmaskers:
            repeatmasker_id, notification = import_analyses(taxon, assembly_id, repeatmasker, "repeatmasker", userID)
            if repeatmasker_id:
                summary["repeatmaskerIDs"] += [repeatmasker_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(repeatmaskers)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 100
                updateTask(taskID, "running", progress)
        except:
            pass

        if len(notifications) == 0:
            notifications += createNotification("Success", "All files successfully imported!", "success")

        return summary, notifications
    except Exception as err:
        deleteAssemblyByAssemblyID(assembly_id)
        return summary, createNotification(message=f"CombinedImportError2: {str(err)}")


def readArgs():
    if len(argv) <= 1:
        print("No arguments provided!")
        print("Help!")
        return 0

    args = argv[1:]

    if "-h" in args or "--help" in args:
        print("Help!")
        return 0

    if len(args) != 9:
        print("Invalid number of arguments")
        print("Help!")
        return 0

    try:
        taxon = loads(args[0])
        assembly = loads(args[1])
        annotations = loads(args[2])
        mappings = loads(args[3])
        buscos = loads(args[4])
        fcats = loads(args[5])
        taxaminers = loads(args[6])
        repeatmaskers = loads(args[7])
        assembly_id = int(args[8])

        return (
            taxon,
            assembly,
            annotations,
            mappings,
            buscos,
            fcats,
            taxaminers,
            repeatmaskers,
            assembly_id,
        )

    except Exception as err:
        print(err)
        return {}, {}, [], [], [], [], [], [], 0


if __name__ == "__main__":
    args = readArgs()
    if not args:
        exit(0)

    try:
        (
            taxon,
            assembly,
            annotations,
            mappings,
            buscos,
            fcats,
            taxaminers,
            repeatmaskers,
            assembly_id,
        ) = args

        if "taxonID" in taxon:
            taxon, notifcation = fetchTaxonByTaxonID(taxon["taxonID"])
        elif "ncbiTaxonID" in taxon:
            ncbiID = taxon["ncbiTaxonID"]
            taxon, notifcation = fetchTaxonByNCBITaxonID(ncbiID)
            if len(taxon) == 1:
                taxon = taxon[0]
            else:
                gnom_tax_ids_string = "\n".join([x["id"] + ": " + taxon["scientificName"] for x in taxon])
                print(
                    f"Multiple taxon IDs for NCBI taxon id {ncbiID} found:\n{gnom_tax_ids_string}\nPlease specify parameter taxonID for this dataset with one of the above taxonIDs!"
                )
                exit(0)

        import_summary, notifcations = importDataset(
            taxon,
            assembly,
            1,
            annotations,
            mappings,
            buscos,
            fcats,
            taxaminers,
            repeatmaskers,
            assembly_id,
        )

        for n in notifcations:
            print(n)

        print("Summary: ", import_summary, "\n")
    except Exception as err:
        print(err)

    exit(0)
