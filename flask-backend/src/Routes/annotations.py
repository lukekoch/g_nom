# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import validateActiveToken
from modules.notifications import createNotification
from modules.annotations import deleteAnnotationByAnnotationID, fetchAnnotationsByAssemblyID, import_annotation

# setup blueprint name
annotations_bp = Blueprint("annotations", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# IMPORT NEW ANNOTATION
@annotations_bp.route("/import_annotation", methods=["POST"])
def annotations_bp_import_annotation():
    if request.method == "POST":
        req = request.get_json(force=True)

        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxon = req.get("taxon", None)
        dataset = req.get("dataset", None)
        assemblyID = req.get("assemblyID", None)

        if taxon and dataset and userID:
            data, notification = import_annotation(taxon, assemblyID, dataset, userID)
        else:
            data, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE ASSEMBLY BY ASSEMBLY ID
@annotations_bp.route("/deleteAnnotationByAnnotationID", methods=["GET"])
def annotations_bp_deleteAnnotationByAnnotationID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        annotation_id = request.args.get("annotationID")

        status, notification = deleteAnnotationByAnnotationID(annotation_id)

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON
@annotations_bp.route("/fetchAnnotationsByAssemblyID", methods=["GET"])
def annotations_bp_fetchAnnotationsByAssemblyID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID")
        data, notification = fetchAnnotationsByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
