# general imports
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import DatabaseManager

# setup blueprint name
db = Blueprint("db", __name__)

# API
api = DatabaseManager()

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": {
        "label": "Error",
        "message": "Wrong request method. Please contact support!",
        "type": "error",
    },
}


# ================== USER ================== #
# ADD NEW USER
@db.route("/addUser", methods=["GET", "POST"])
def addUser():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, notification = api.addUser(
            req.get("username", None), req.get("password", None), req.get("role", None)
        )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL USERS
@db.route("/fetchAllUsers", methods=["GET"])
def fetchAllUsers():
    if request.method == "GET":
        data, notification = api.fetchALLUsers()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE USER BY USER ID
@db.route("/deleteUserByUserID", methods=["GET"])
def deleteUserByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        data, notification = api.deleteUserByUserID(userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE USER ROLE BY USER ID
@db.route("/updateUserRoleByUserID", methods=["GET"])
def updateUserRoleByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        role = request.args.get("role")
        data, notification = api.updateUserRoleByUserID(userID, role)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ================== TAXON ================== #
# IMPORT ALL FROM TAXDUMP FILE
@db.route("/reloadTaxonIDsFromFile", methods=["GET"])
def reloadTaxonIDsFromFile():
    if request.method == "GET":
        userID = request.args.get("userID")
        data, notification = api.reloadTaxonIDsFromFile(userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ONE TAXON BY TAXON ID
@db.route("/fetchTaxonByNCBITaxonID", methods=["GET"])
def fetchTaxonByNCBITaxonID():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        data, notification = api.fetchTaxonByNCBITaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ONE TAXON BY TAXON ID
@db.route("/updateImageByTaxonID", methods=["GET"])
def updateImageByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        path = request.args.get("path")
        userID = request.args.get("userID")
        data, notification = api.updateImageByTaxonID(taxonID, path, userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ONE TAXON BY TAXON ID
@db.route("/removeImageByTaxonID", methods=["GET"])
def removeImageByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        userID = request.args.get("userID")
        data, notification = api.removeImageByTaxonID(taxonID, userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ================== ASSEMBLY ================== #
# FETCH ALL ASSEMBLIES
@db.route("/fetchAllAssemblies", methods=["GET"])
def fetchAllAssemblies():
    if request.method == "GET":
        page = request.args.get("page")
        range = request.args.get("range")
        search = request.args.get("search")
        userID = request.args.get("userID")
        data, pagination, notification = api.fetchAllAssemblies(
            page, range, search, userID
        )

        response = jsonify(
            {"payload": data, "pagination": pagination, "notification": notification}
        )
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ASSEMBLY BY NCBI TAXON ID
@db.route("/fetchAssembliesByTaxonID", methods=["GET"])
def fetchAssembliesByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        data, notification = api.fetchAssembliesByTaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ONE ASSEMBLY
@db.route("/fetchAssemblyInformationByAssemblyID", methods=["GET"])
def fetchAssemblyInformationByAssemblyID():
    if request.method == "GET":
        id = request.args.get("id")
        data, notification = api.fetchAssemblyInformationByAssemblyID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# CREATE NEW ASSEMBLY
@db.route("/addNewAssembly", methods=["GET"])
def addNewAssembly():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        name = request.args.get("name")
        path = request.args.get("path")
        userID = request.args.get("userID")
        additionalFiles = request.args.get("additionalFilesPath")
        data, notification = api.addNewAssembly(
            taxonID, name, path, userID, additionalFiles
        )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# REMOVE ASSEMBLY
@db.route("/removeAssemblyByAssemblyID", methods=["GET"])
def removeAssemblyByAssemblyID():
    if request.method == "GET":
        id = request.args.get("id")
        data, notification = api.removeAssemblyByAssemblyID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ================== GENERAL INFO ANY LEVEL ================== #
# FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL
@db.route("/fetchGeneralInfosByID", methods=["GET"])
def fetchGeneralInfos():
    if request.method == "GET":
        level = request.args.get("level")
        id = request.args.get("id")
        data, notification = api.fetchGeneralInfosByID(level, id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD GENERAL INFO
@db.route("/addGeneralInfo", methods=["GET"])
def addGeneralInfo():
    if request.method == "GET":
        level = request.args.get("level")
        id = request.args.get("id")
        key = request.args.get("key")
        value = request.args.get("value")
        data, notification = api.addGeneralInfo(level, id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE GENERAL INFO
@db.route("/updateGeneralInfoByID", methods=["GET"])
def updateGeneralInfoByID():
    if request.method == "GET":
        level = request.args.get("level")
        id = request.args.get("id")
        key = request.args.get("key")
        value = request.args.get("value")
        data, notification = api.updateGeneralInfoByID(level, id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# REMOVE GENERAL INFO
@db.route("/removeGeneralInfoByID", methods=["GET"])
def removeGeneralInfoByID():
    if request.method == "GET":
        level = request.args.get("level")
        id = request.args.get("id")
        data, notification = api.removeGeneralInfoByID(level, id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
