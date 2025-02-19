import { Book, Bookmark, Close, Configure, Contract, Down, LinkTop, Up } from "grommet-icons";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TaxaminerDashboard } from "./components/TaxonomicAssignmentDashboard/dashboard";

import {
  addBookmark,
  fetchAnnotationsByAssemblyID,
  fetchAssemblyByAssemblyID,
  fetchAssemblyGeneralInformationByAssemblyID,
  fetchAssemblySequenceHeaders,
  fetchAssemblyTagsByAssemblyID,
  fetchBuscoAnalysesByAssemblyID,
  fetchFcatAnalysesByAssemblyID,
  fetchMappingsByAssemblyID,
  fetchTaXaminerAnalysesByAssemblyID,
  fetchRepeatmaskerAnalysesByAssemblyID,
  fetchTaxonByTaxonID,
  fetchTaxonGeneralInformationByTaxonID,
  IAnnotation,
  IAssemblySequenceHeader,
  IBuscoAnalysis,
  IFcatAnalysis,
  IGeneralInformation,
  IMapping,
  ITaxaminerAnalysis,
  INcbiTaxon,
  IRepeatmaskerAnalysis,
  NotificationObject,
  removeBookmark,
} from "../../../../api";
import Button from "../../../../components/Button";
import LoadingSpinner from "../../../../components/LoadingSpinner";

import GeneralInformationViewer from "./components/GeneralInformationViewer";
import GenomeViewer from "./components/GenomeViewer";
import AssemblyStatisticsPlotViewer from "./components/AssemblyStatisticsPlotViewer";
import AssemblyStatisticsTable from "./components/AssemblyStatisticsTable";
import { useNotification } from "../../../../components/NotificationProvider";
import TaxonomicAssignmentViewer from "./components/TaxonomicAssignmentViewer";
import MaskingsViewer from "./components/MaskingsViewer";
import { AssemblyInterface, AssemblyTagInterface } from "../../../../tsInterfaces/tsInterfaces";
import SpeciesProfilePictureViewer from "../../../../components/SpeciesProfilePictureViewer";
import AssemblyAlphabetPlotViewer from "./components/AssemblyAlphabetPlotViewer";
import AssemblySequenceHeaderTable from "./components/AssemblySequenceHeaderTable";
import BuscoViewer from "./components/BuscoViewer";
import FcatViewer from "./components/FcatViewer";
import AssemblyTagList from "./components/AssemblyTagList";
import FeaturesList from "../FeaturesList";
import AnnotationStatisticsPlotViewer from "./components/AnnotationStatisticsPlotViewer";

const AssemblyInformation = () => {
  const [assembly, setAssembly] = useState<AssemblyInterface>();
  const [assemblyHeaders, setAssemblyHeaders] = useState<IAssemblySequenceHeader[]>([]);
  const [assemblyHeadersOffset, setAssemblyHeaderOffset] = useState<number>(0);
  const [tags, setTags] = useState<AssemblyTagInterface[]>([]);
  const [taxon, setTaxon] = useState<INcbiTaxon>();
  const [assemblyGeneralInformation, setAssemblyGeneralInformation] = useState<
    IGeneralInformation[]
  >([]);
  const [taxonGeneralInformation, setTaxonGeneralInformation] = useState<IGeneralInformation[]>([]);
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
  const [mappings, setMappings] = useState<IMapping[]>([]);
  const [buscoAnalyses, setBuscoAnalyses] = useState<IBuscoAnalysis[]>([]);
  const [fcatAnalyses, setFcatAnalyses] = useState<IFcatAnalysis[]>([]);
  const [taxaminerAnalyses, setTaxaminerAnalyses] = useState<ITaxaminerAnalysis[]>([]);
  const [repeatmaskerAnalyses, setRepeatmaskerAnalyses] = useState<IRepeatmaskerAnalysis[]>([]);

  const [fetchingTaxon, setFetchingTaxon] = useState<boolean>(false);
  const [fetchingTaxonGeneralInformation, setFetchingTaxonGeneralInformation] =
    useState<boolean>(false);
  const [fetchingAssembly, setFetchingAssembly] = useState<boolean>(true);
  const [fetchingAssemblyHeaders, setFetchingAssemblyHeaders] = useState<boolean>(false);
  const [fetchingAssemblyGeneralInformation, setFetchingAssemblyGeneralInformation] =
    useState<boolean>(false);
  const [fetchingAssemblyTags, setFetchingAssemblyTags] = useState<boolean>(false);
  const [fetchingAnnotations, setFetchingAnnotations] = useState<boolean>(false);
  const [fetchingMappings, setFetchingMappings] = useState<boolean>(false);
  const [fetchingBuscoAnalyses, setFetchingBuscoAnalyses] = useState<boolean>(false);
  const [fetchingFcatAnalyses, setFetchingFcatAnalyses] = useState<boolean>(false);
  const [fetchingTaxaminerAnalyses, setFetchingTaxaminerAnalyses] = useState<boolean>(false);
  const [fetchingRepeatmaskerAnalyses, setFetchingRepeatmaskerAnalyses] = useState<boolean>(false);

  const [hoverBookmark, setHoverBookmark] = useState<boolean>(false);

  const [toggleTaxon, setToggleTaxon] = useState<boolean>(true);
  const [toggleAssembly, setToggleAssembly] = useState<boolean>(true);
  const [toggleAnnotations, setToggleAnnotations] = useState<boolean>(false);
  const [toggleBuscoAnalyses, setToggleBuscoAnalyses] = useState<boolean>(false);
  const [toggleFcatAnalyses, setToggleFcatAnalyses] = useState<boolean>(false);
  const [toggleTaxaminerAnalyses, setToggleTaxaminerAnalyses] = useState<boolean>(false);
  const [toggleRepeatmaskerAnalyses, setToggleRepeatmaskerAnalyses] = useState<boolean>(false);
  const [toggleGenomeViewer, setToggleGenomeViewer] = useState<boolean>(false);

  const [taxonomicAssignmentLoading, setTaxonomicAssignmentLoading] = useState<boolean>(false);

  const [sequenceHeaderSearch, setSequenceHeaderSearch] = useState<string>("");

  const [scroll, setScroll] = useState<boolean>(false);
  const [location, setLocation] = useState<string>("");

  const [searchParams, setSearchParams] = useSearchParams();
  const assemblyID = searchParams.get("assemblyID");
  const queryLocation = searchParams.get("location");

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    loadAssembly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    loadAssemblyTags();
    loadAnnotations();
    loadMappings();
    const timeout1 = setTimeout(() => {
      loadBuscoAnalyses();
      loadFcatAnalysees();
      loadTaxaminerAnalyses();
      loadRepeatmaskerAnalyses();
    }, 2000);

    return () => clearTimeout(timeout1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.id]);

  useEffect(() => {
    loadAssemblySequenceHeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.id, assemblyHeadersOffset, sequenceHeaderSearch]);

  useEffect(() => {
    loadAssemblyGeneralInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.id]);

  useEffect(() => {
    loadTaxon();
    loadTaxonGeneralInformation();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.taxonID]);

  useEffect(() => {
    if (location && scroll) {
      setToggleGenomeViewer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, assembly?.id]);

  useEffect(() => {
    if (queryLocation) {
      setLocation(queryLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryLocation]);

  const loadAssembly = async () => {
    setFetchingAssembly(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token && assemblyID) {
      const id = parseInt(assemblyID.replace(":", ""));
      await fetchAssemblyByAssemblyID(id, userID, token).then((response) => {
        if (response && response.payload) {
          setAssembly(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssembly(false);
  };

  const loadAssemblySequenceHeaders = async () => {
    setFetchingAssemblyHeaders(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token && assembly?.id) {
      await fetchAssemblySequenceHeaders(
        assembly.id,
        10,
        assemblyHeadersOffset,
        sequenceHeaderSearch,
        userID,
        token
      ).then((response) => {
        if (response && response.payload) {
          setAssemblyHeaders(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssemblyHeaders(false);
  };

  const loadAssemblyGeneralInformation = async () => {
    setFetchingAssemblyGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAssemblyGeneralInformationByAssemblyID(assembly.id, userID, token).then(
        (response) => {
          if (response && response.payload) {
            setAssemblyGeneralInformation(response.payload);
          }
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        }
      );
    }
    setFetchingAssemblyGeneralInformation(false);
  };

  const loadAssemblyTags = async () => {
    setFetchingAssemblyTags(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAssemblyTagsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setTags(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssemblyTags(false);
  };

  const loadTaxon = async () => {
    setFetchingTaxon(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.taxonID && userID && token) {
      await fetchTaxonByTaxonID(assembly.taxonID, userID, token).then((response) => {
        if (response && response.payload) {
          setTaxon(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingTaxon(false);
  };

  const loadTaxonGeneralInformation = async () => {
    setFetchingTaxonGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.taxonID && userID && token) {
      await fetchTaxonGeneralInformationByTaxonID(assembly.taxonID, userID, token).then(
        (response) => {
          if (response && response.payload) {
            setTaxonGeneralInformation(response.payload);
          }
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        }
      );
    }
    setFetchingTaxonGeneralInformation(false);
  };

  const loadAnnotations = async () => {
    setFetchingAnnotations(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAnnotationsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setAnnotations(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAnnotations(false);
  };

  const loadMappings = async () => {
    setFetchingMappings(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchMappingsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setMappings(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingMappings(false);
  };

  const loadBuscoAnalyses = async () => {
    setFetchingBuscoAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchBuscoAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setBuscoAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingBuscoAnalyses(false);
  };

  const loadFcatAnalysees = async () => {
    setFetchingFcatAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchFcatAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setFcatAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingFcatAnalyses(false);
  };

  const loadTaxaminerAnalyses = async () => {
    setFetchingTaxaminerAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchTaXaminerAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setTaxaminerAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingTaxaminerAnalyses(false);
  };

  const loadRepeatmaskerAnalyses = async () => {
    setFetchingRepeatmaskerAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchRepeatmaskerAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setRepeatmaskerAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingRepeatmaskerAnalyses(false);
  };

  const handleBookmarkAssembly = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      if (!assembly.bookmarked) {
        await addBookmark(userID, assembly.id, token).then((response) => {
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        });
      } else {
        await removeBookmark(userID, assembly.id, token).then((response) => {
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        });
      }
    }
  };

  const shrinkAll = () => {
    setToggleTaxon(true);
    setToggleAssembly(false);
    setToggleAnnotations(false);
    setToggleBuscoAnalyses(false);
    setToggleFcatAnalyses(false);
    setToggleTaxaminerAnalyses(false);
    setToggleRepeatmaskerAnalyses(false);
    setToggleGenomeViewer(false);
    window.scrollTo(0, 0);
  };

  const userRole = JSON.parse(sessionStorage.getItem("userRole") || "");

  const ref1 = useRef<HTMLDivElement>(null);

  return (
    <div className="pb-32 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="h-1 bg-gradient-to-t from-gray-900 via-gray-500 to-gray-200" />
      <div className="z-20 flex justify-between items-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 text-white sticky top-16 py-2 px-4 text-xl font-bold shadow-lg border-b border-gray-500">
        {taxon && assembly ? (
          <div className="flex justify-start items-center w-3/4">
            <div className="px-2 whitespace-nowrap animate-fade-in">{taxon.scientificName}</div>
            <div className="px-2 animate-fade-in">{">"}</div>
            <div
              ref={ref1}
              onMouseLeave={() => {
                ref1.current?.scrollTo(0, 0);
              }}
              className="px-2 animate-fade-in truncate hover:whitespace-normal hover:text-clip hover:overflow-auto"
            >
              {assembly?.label ? assembly.label : assembly.name}
            </div>
          </div>
        ) : (
          <div>
            {fetchingAssembly ||
              (fetchingTaxon ? (
                <div className="animate-fade-in">
                  <LoadingSpinner label="Loading..." />
                </div>
              ) : (
                <div className="animate-fade-in">Data not available!</div>
              ))}
          </div>
        )}
        <div className="flex items-center">
          {taxon?.id && assembly?.id && (userRole === "admin" || userRole === "user") && (
            <Link
              to={"/g-nom/assemblies/data?taxID=" + taxon.id + "&assemblyID=" + assembly.id}
              className="mr-4 animate-fade-in"
            >
              <Button onClick={() => shrinkAll()} color="secondary">
                <Configure className="stroke-current animate-grow-y" color="blank" />
              </Button>
            </Link>
          )}
          <div className="mr-4 animate-fade-in">
            <Button onClick={() => shrinkAll()} color="secondary">
              <Contract className="stroke-current animate-grow-y" color="blank" />
            </Button>
          </div>
          <div className="mr-4 animate-fade-in">
            <Button onClick={() => window.scrollTo(0, 0)} color="secondary">
              <LinkTop className="stroke-current animate-grow-y" color="blank" />
            </Button>
          </div>
          <div
            onMouseEnter={() => setHoverBookmark(true)}
            onMouseLeave={() => setHoverBookmark(false)}
            className="animate-fade-in"
          >
            <Button onClick={() => handleBookmarkAssembly()} color="secondary">
              {!assembly?.bookmarked ? (
                <Bookmark className="stroke-current animate-grow-y" color="blank" />
              ) : (
                <div>
                  {!hoverBookmark ? (
                    <Book className="stroke-current animate-grow-y" color="blank" />
                  ) : (
                    <Close className="stroke-current animate-grow-y" color="blank" />
                  )}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main information grid */}
      {assembly && assembly.id ? (
        <div className="grid grid-cols-5 gap-4 px-2 py-2 animate-fade-in">
          <div
            onClick={() => setToggleTaxon((prevState) => !prevState)}
            className="col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
          >
            <div className="w-96">Taxon information</div>
            <div className="text-sm">
              {(fetchingTaxon || fetchingTaxonGeneralInformation) && (
                <LoadingSpinner label="Loading assembly data..." />
              )}
            </div>
            <div className="flex items-center w-96 justify-end">
              {toggleTaxon ? (
                <Down className="stroke-current animate-grow-y" color="blank" />
              ) : (
                <Up className="stroke-current animate-grow-y" color="blank" />
              )}
            </div>
          </div>

          {/* TAXON IMAGE*/}
          <div className="flex justify-center items-center">
            {toggleTaxon && (
              <div className="w-full h-full shadow animate-fade-in bg-gray-500 overflow-hidden bg-white border-4 border-double border-gray-300">
                {taxon?.id && (
                  <SpeciesProfilePictureViewer
                    taxonID={taxon.id}
                    imagePath={taxon?.imagePath}
                    useTimestamp={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* TAXON GENERAL INFORMATION*/}
          <div className="flex justify-center col-span-4">
            {toggleTaxon && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {taxon?.id && <GeneralInformationViewer generalInfos={taxonGeneralInformation} />}
              </div>
            )}
          </div>

          <div
            onClick={() => setToggleAssembly((prevState) => !prevState)}
            className="mt-8 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
          >
            <div className="w-96">Assembly information</div>
            <div className="text-sm">
              {(fetchingAssemblyGeneralInformation ||
                fetchingAssembly ||
                fetchingAssemblyHeaders ||
                fetchingAssemblyTags) && <LoadingSpinner label="Loading assembly data..." />}
            </div>
            <div className="flex items-center w-96 justify-end">
              {toggleAssembly ? (
                <Down className="stroke-current animate-grow-y" color="blank" />
              ) : (
                <Up className="stroke-current animate-grow-y" color="blank" />
              )}
            </div>
          </div>

          {/* ASSEMBLY STATISTICS PLOT */}
          <div className="flex justify-center col-span-3">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly && assembly.id && <AssemblyStatisticsPlotViewer assembly={assembly} />}
              </div>
            )}
          </div>

          {/* ASSEMBLY STATISTICS TABLE */}
          <div className="flex justify-center col-span-2">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly && assembly.id && <AssemblyStatisticsTable assembly={assembly} />}
              </div>
            )}
          </div>

          {/* ASSEMBLY ALPHABET PLOT */}
          <div className="flex justify-center col-span-2">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly?.id && <AssemblyAlphabetPlotViewer assembly={assembly} />}
              </div>
            )}
          </div>

          {/* ASSEMBLY SEQUENCE HEADERS (LARGEST 10) */}
          <div className="flex justify-center col-span-3">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly?.id && (
                  <AssemblySequenceHeaderTable
                    sequenceHeaders={assemblyHeaders}
                    setSequenceHeaderSearch={setSequenceHeaderSearch}
                    setLocation={setLocation}
                    setOffset={setAssemblyHeaderOffset}
                  />
                )}
              </div>
            )}
          </div>

          {/* ASSEMBLY GENERAL INFORMATION*/}
          <div className="flex justify-center col-span-3">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly?.id && (
                  <GeneralInformationViewer generalInfos={assemblyGeneralInformation} />
                )}
              </div>
            )}
          </div>

          {/* ASSEMBLY TAGS*/}
          <div className="flex justify-center col-span-2">
            {toggleAssembly && (
              <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                {assembly?.id && <AssemblyTagList tags={tags} />}
              </div>
            )}
          </div>

          {/* TAXAMINER - Taxonomic assignment */}
          {taxaminerAnalyses && taxaminerAnalyses.length > 0 && (
            <div
              onClick={() => setToggleTaxaminerAnalyses((prevState) => !prevState)}
              className="mt-8 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
            >
              <div className="w-96">Taxonomic assignment (Dashboard)</div>
              <div className="text-sm">
                {(fetchingTaxaminerAnalyses ||
                  (taxonomicAssignmentLoading && toggleTaxaminerAnalyses)) && (
                  <LoadingSpinner label="Loading taXaminer data..." />
                )}
              </div>
              <div className="flex items-center w-96 justify-end">
                {toggleTaxaminerAnalyses ? (
                  <Down className="stroke-current animate-grow-y" color="blank" />
                ) : (
                  <Up className="stroke-current animate-grow-y" color="blank" />
                )}
              </div>

            </div>
          )}
          {taxaminerAnalyses && taxaminerAnalyses.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleTaxaminerAnalyses && (
                <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                  <TaxaminerDashboard
                  assembly_id = {parseInt(assemblyID!.replace(":", ""))}
                  analyses = {taxaminerAnalyses}
                  setLocation={setLocation}
                  setAutoScroll={setScroll}
                  ></TaxaminerDashboard>
                </div>
              )}
            </div>
          )}

          {/* ANNOTATION */}
          {assembly?.id && annotations && annotations.length > 0 && (
            <div
              onClick={() => setToggleAnnotations((prevState) => !prevState)}
              className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
            >
              <div className="w-96">Annotation information</div>
              <div className="text-sm">
                {fetchingAnnotations && <LoadingSpinner label="Loading annotation data..." />}
              </div>
              <div className="flex items-center w-96 justify-end">
                {toggleAnnotations ? (
                  <Down className="stroke-current animate-grow-y" color="blank" />
                ) : (
                  <Up className="stroke-current animate-grow-y" color="blank" />
                )}
              </div>
            </div>
          )}
          {assembly?.id && annotations && annotations.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleAnnotations && (
                <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                  <FeaturesList title="Features by assembly" assemblyID={assembly.id} />
                </div>
              )}
            </div>
          )}
          {assembly?.id && annotations && annotations.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleAnnotations && (
                <div className="w-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                  <AnnotationStatisticsPlotViewer annotations={annotations} />
                </div>
              )}
            </div>
          )}

          {/* BUSCO & FCAT */}
          {((buscoAnalyses && buscoAnalyses.length > 0) ||
            (fcatAnalyses && fcatAnalyses.length > 0)) && (
            <div
              onClick={() => {
                setToggleBuscoAnalyses((prevState) => !prevState);
                setToggleFcatAnalyses((prevState) => !prevState);
              }}
              className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
            >
              <div className="w-96">Annotation completeness</div>
              <div className="text-sm">
                {(fetchingBuscoAnalyses || fetchingFcatAnalyses) && (
                  <LoadingSpinner label="Loading busco/fcat data..." />
                )}
              </div>
              <div className="flex items-center w-96 justify-end">
                {toggleBuscoAnalyses ? (
                  <Down className="stroke-current animate-grow-y" color="blank" />
                ) : (
                  <Up className="stroke-current animate-grow-y" color="blank" />
                )}
              </div>
            </div>
          )}

          {/* BUSCO */}
          {buscoAnalyses && buscoAnalyses.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleBuscoAnalyses && (
                <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                  <BuscoViewer taxon={taxon} assembly={assembly} busco={buscoAnalyses} />
                </div>
              )}
            </div>
          )}

          {/* FCAT */}
          {fcatAnalyses && fcatAnalyses.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleFcatAnalyses && (
                <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
                  <FcatViewer taxon={taxon} assembly={assembly} fcat={fcatAnalyses} />
                </div>
              )}
            </div>
          )}

          {/* REPEATMASKER */}
          {repeatmaskerAnalyses && repeatmaskerAnalyses.length > 0 && (
            <div
              onClick={() => setToggleRepeatmaskerAnalyses((prevState) => !prevState)}
              className="mt-12 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
            >
              <div className="w-96">Repeatmasking</div>
              <div className="text-sm">
                {fetchingRepeatmaskerAnalyses && (
                  <LoadingSpinner label="Loading repeatmasker data..." />
                )}
              </div>
              <div className="flex items-center w-96 justify-end">
                {toggleRepeatmaskerAnalyses ? (
                  <Down className="stroke-current animate-grow-y" color="blank" />
                ) : (
                  <Up className="stroke-current animate-grow-y" color="blank" />
                )}
              </div>
            </div>
          )}

          {repeatmaskerAnalyses && repeatmaskerAnalyses.length > 0 && (
            <div className="flex justify-center col-span-5">
              {toggleRepeatmaskerAnalyses && (
                <div className="w-full h-full overflow-hidden">
                  <MaskingsViewer
                    assembly={assembly}
                    taxon={taxon}
                    repeatmasker={repeatmaskerAnalyses}
                  />
                </div>
              )}
            </div>
          )}

          {/* GENOME VIEWER */}
          <div
            onClick={() => setToggleGenomeViewer((prevState) => !prevState)}
            className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
          >
            <div className="w-96">Genome viewer</div>
            <div className="text-sm">
              {(fetchingAnnotations || fetchingMappings || fetchingAssembly) && (
                <LoadingSpinner label="Loading viewer data..." />
              )}
            </div>
            <div className="flex items-center w-96 justify-end">
              {toggleGenomeViewer ? (
                <Down className="stroke-current animate-grow-y" color="blank" />
              ) : (
                <Up className="stroke-current animate-grow-y" color="blank" />
              )}
            </div>
          </div>

          <div className="flex justify-center col-span-5">
            {toggleGenomeViewer &&
            !fetchingAssembly &&
            !fetchingAnnotations &&
            !fetchingMappings ? (
              <div className="w-full h-full animate-fade-in overflow-hidden">
                {assembly && assembly.id && (
                  <GenomeViewer
                    assemblyDetails={assembly}
                    annotations={annotations}
                    mappings={mappings}
                    location={location}
                  />
                )}
              </div>
            ) : (
              <div className="w-full flex justify-center items center h-32" />
            )}
          </div>
        </div>
      ) : (
        <div className="h-75"></div>
      )}
    </div>
  );
};

export default AssemblyInformation;
