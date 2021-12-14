import { useState } from "react";
import {
  IImportFileInformation,
  importAssembly,
  INcbiTaxon,
  NotificationObject,
} from "../../../../../../../../../../api";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import FileTree from "../../../../../../../../../../components/FileTree";
import Button from "../../../../../../../../../../components/Button";

const NewAssemblyImportForm = ({ taxon }: { taxon: INcbiTaxon }) => {
  const [newAssembly, setNewAssembly] = useState<IImportFileInformation>();
  const [newAnnotations, setNewAnnotations] = useState<IImportFileInformation[]>([]);
  const [newMappings, setNewMappings] = useState<IImportFileInformation[]>([]);
  const [newBuscos, setNewBuscos] = useState<IImportFileInformation[]>([]);
  const [newFcats, setNewFcats] = useState<IImportFileInformation[]>([]);
  const [newMilts, setNewMilts] = useState<IImportFileInformation[]>([]);
  const [newRepeatmaskers, setNewRepeatmaskers] = useState<IImportFileInformation[]>([]);

  const [importing, setImporting] = useState<boolean>(false);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const alreadyMarkedForImport = (f: IImportFileInformation, fList: IImportFileInformation[]) => {
    const isDuplicate = fList.some((marked_file) => {
      if (marked_file.id === f.id) {
        return true;
      }
      if (marked_file.children && marked_file.children.length > 0) {
        const found = marked_file.children.find((child) => child.id === f.id);
        if (found) {
          return true;
        }
      }

      return false;
    });

    if (isDuplicate) {
      handleNewNotification({
        label: "Info",
        message: "File already marked for import!",
        type: "info",
      });
    }
    return isDuplicate;
  };

  const handleDropFileInformation = (fileInformation: IImportFileInformation) => {
    const fileInformationType = fileInformation.type || fileInformation.dirType || "";

    if (fileInformation.dirType) {
      if (fileInformation.mainFiles[fileInformationType].length > 1) {
        handleNewNotification({
          label: "Warning",
          message: "Multiple importable files detected!",
          type: "warning",
        });
      }
    }

    if (fileInformationType) {
      switch (fileInformationType) {
        case "sequence":
          setNewAssembly(fileInformation);
          break;
        case "annotation":
          !alreadyMarkedForImport(fileInformation, newAnnotations) &&
            setNewAnnotations((prevState) => [...prevState, fileInformation]);
          break;
        case "mapping":
          !alreadyMarkedForImport(fileInformation, newMappings) &&
            setNewMappings((prevState) => [...prevState, fileInformation]);
          break;
        case "busco":
          !alreadyMarkedForImport(fileInformation, newBuscos) &&
            setNewBuscos((prevState) => [...prevState, fileInformation]);
          break;
        case "fcat":
          !alreadyMarkedForImport(fileInformation, newFcats) &&
            setNewFcats((prevState) => [...prevState, fileInformation]);
          break;
        case "milts":
          !alreadyMarkedForImport(fileInformation, newMilts) &&
            setNewMilts((prevState) => [...prevState, fileInformation]);
          break;
        case "repeatmasker":
          !alreadyMarkedForImport(fileInformation, newRepeatmaskers) &&
            setNewRepeatmaskers((prevState) => [...prevState, fileInformation]);
          break;
        default:
          break;
      }
    }
  };

  const handleSubmitImport = async () => {
    setImporting(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (taxon.id && newAssembly && newAssembly.path && userID && token) {
      const response = await importAssembly(taxon, newAssembly.path, parseInt(userID), token);

      if (response && response.notification?.length > 0) {
        response.notification.map((notification: any) => handleNewNotification(notification));
      }
    } else {
      handleNewNotification({
        label: "Error",
        message: "Mising input!",
        type: "error",
      });
    }
    setImporting(false);
  };

  const handleResetForm = () => {
    setNewAssembly(undefined);
    setNewAnnotations([]);
    setNewMappings([]);
    setNewBuscos([]);
    setNewFcats([]);
    setNewMilts([]);
    setNewRepeatmaskers([]);
  };

  // const excludeFileAssembly = (f: IImportFileInformation) => {
  //   if (newAssembly?.children && newAssembly.children.length > 0) {
  //     const newChildren = newAssembly.children.filter(
  //       (child) => child.id !== f.id || newAssembly.mainFiles["sequence"]?.includes(child.path)
  //     );
  //     return { ...newAssembly, children: newChildren };
  //   }
  // };

  // const excludeFile = (f: IImportFileInformation, fList: IImportFileInformation[]) => {
  //   const newFileInformation = fList.map((marked_file) => {
  //     if (marked_file.id === f.id) {
  //       return undefined;
  //     }
  //     if (marked_file.children && marked_file.children.length > 0) {
  //       const newChildren = marked_file.children.filter((child) => child.id !== f.id);
  //       return { ...marked_file, children: newChildren };
  //     }

  //     return marked_file;
  //   });

  //   return newFileInformation;
  // };

  // const handleExcludeFile = (type: string, fileInformation: IImportFileInformation) => {
  //   switch (type) {
  //     case "sequence":
  //       setNewAssembly(excludeFileAssembly(fileInformation));
  //       break;
  //     case "annotation":
  //       setNewAnnotations((prevState) => [...prevState, fileInformation]);
  //       break;
  //     case "mapping":
  //       setNewMappings((prevState) => [...prevState, fileInformation]);
  //       break;
  //     case "busco":
  //       setNewBuscos((prevState) => [...prevState, fileInformation]);
  //       break;
  //     case "fcat":
  //       setNewFcats((prevState) => [...prevState, fileInformation]);
  //       break;
  //     case "milts":
  //       setNewMilts((prevState) => [...prevState, fileInformation]);
  //       break;
  //     case "repeatmasker":
  //       setNewRepeatmaskers((prevState) => [...prevState, fileInformation]);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <div className="animate-grow-y">
      <div className="px-4 py-2 font-semibold text-sm text-white bg-gray-500 border-b border-t border-white">
        Add new assembly...
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div
          className="border rounded-lg p-2"
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDrop={(e) => handleDropFileInformation(JSON.parse(e.dataTransfer.getData("fileInfos")))}
        >
          {/* Assembly */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Assembly</div>
            {newAssembly ? (
              <div>
                <div
                  className="ml-4 animate-fade-in"
                  // onClick={() => setNewAssembly(undefined)}
                >
                  {newAssembly.name}
                </div>
                {newAssembly.children &&
                  newAssembly.children.length > 0 &&
                  newAssembly.children.map((child) => (
                    <div
                      key={child.id}
                      className="ml-8 animate-fade-in"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   handleExcludeFile("sequence", child);
                      // }}
                    >
                      {child.name}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* Annotations */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Annotations</div>
            {newAnnotations && newAnnotations.length > 0 ? (
              newAnnotations.map((annotation) => (
                <div key={annotation.id}>
                  <div className="ml-4 animate-fade-in">{annotation.name}</div>
                  {annotation.children &&
                    annotation.children.length > 0 &&
                    annotation.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* Mappings */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Mappings</div>
            {newMappings && newMappings.length > 0 ? (
              newMappings.map((mapping) => (
                <div key={mapping.id}>
                  <div className="ml-4 animate-fade-in">{mapping.name}</div>
                  {mapping.children &&
                    mapping.children.length > 0 &&
                    mapping.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* Buscos */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Busco</div>
            {newBuscos && newBuscos.length > 0 ? (
              newBuscos.map((busco) => (
                <div key={busco.id}>
                  <div className="ml-4 animate-fade-in">{busco.name}</div>
                  {busco.children &&
                    busco.children.length > 0 &&
                    busco.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* fCats */}
          <div className="py-2 text-sm">
            <div className="font-semibold">fCat</div>
            {newFcats && newFcats.length > 0 ? (
              newFcats.map((fcat) => (
                <div key={fcat.id}>
                  <div className="ml-4 animate-fade-in">{fcat.name}</div>
                  {fcat.children &&
                    fcat.children.length > 0 &&
                    fcat.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* Milts */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Milts</div>
            {newMilts && newMilts.length > 0 ? (
              newMilts.map((milts) => (
                <div key={milts.id}>
                  <div className="ml-4 animate-fade-in">{milts.name}</div>
                  {milts.children &&
                    milts.children.length > 0 &&
                    milts.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          {/* Repeatmaskers */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Repeatmasker</div>
            {newRepeatmaskers && newRepeatmaskers.length > 0 ? (
              newRepeatmaskers.map((repeatmasker) => (
                <div key={repeatmasker.id}>
                  <div className="ml-4 animate-fade-in">{repeatmasker.name}</div>
                  {repeatmasker.children &&
                    repeatmasker.children.length > 0 &&
                    repeatmasker.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <div className="ml-4 animate-fade-in">None</div>
            )}
          </div>
          <hr className="my-4" />
          <div className="flex justify-around items-center py-2">
            <div className="w-28">
              <Button
                color="confirm"
                label={!importing ? "Submit" : "Importing..."}
                onClick={() => handleSubmitImport()}
              />
            </div>
            <div className="w-28">
              <Button color="cancel" label="Reset" onClick={() => handleResetForm()} />
            </div>
          </div>
        </div>
        <div className="max-h-75 min-h-1/2 border rounded-lg">
          <FileTree />
        </div>
      </div>
    </div>
  );
};

export default NewAssemblyImportForm;
