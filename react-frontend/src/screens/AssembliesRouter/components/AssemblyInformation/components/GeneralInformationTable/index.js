import React, { useState, useEffect } from "react";

import { CaretNext, CaretPrevious, Play, Pause, Up, Down } from "grommet-icons";

import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import Button from "../../../../../../components/Button";

const GeneralInformationCarousel = ({
  generalInfos,
  ncbiTaxonID,
  imageStatus,
}) => {
  const [
    taxonGeneralInfoCarouselIndex,
    setTaxonGeneralInfoCarouselIndex,
  ] = useState(0);
  const [taxonGeneralInfoInterval, setTaxonGeneralInfoInterval] = useState(
    undefined
  );

  useEffect(() => {
    setTaxonGeneralInfoInterval(
      setInterval(() => {
        setTaxonGeneralInfoCarouselIndex((prevState) =>
          prevState + 1 < generalInfos.length ? prevState + 1 : 0
        );
      }, 10000)
    );
    return clearInterval(taxonGeneralInfoInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalInfos.length]);

  const handlePauseTaxonGeneralInfoInterval = () => {
    if (taxonGeneralInfoInterval) {
      clearInterval(taxonGeneralInfoInterval);
      setTaxonGeneralInfoInterval(undefined);
    } else {
      setTaxonGeneralInfoInterval(
        setInterval(() => {
          setTaxonGeneralInfoCarouselIndex((prevState) =>
            prevState + 1 < generalInfos.length ? prevState + 1 : 0
          );
        }, 10000)
      );
    }
  };

  const handleShowAll = () => {
    if (taxonGeneralInfoInterval) {
      clearInterval(taxonGeneralInfoInterval);
      setTaxonGeneralInfoInterval(undefined);
      setTaxonGeneralInfoCarouselIndex(-1);
    } else {
      setTaxonGeneralInfoCarouselIndex(0);
      setTaxonGeneralInfoInterval(
        setInterval(() => {
          setTaxonGeneralInfoCarouselIndex((prevState) =>
            prevState + 1 < generalInfos.length ? prevState + 1 : 0
          );
        }, 10000)
      );
    }
  };
  return (
    <div className="animate-fade-in mx-8 rounded-lg shadow-lg rounded-lg px-4 lg:px-8 py-4 bg-gradient-to-b from-indigo-200 to-indigo-50">
      <div className="lg:flex items-center">
        <div className="lg:p-4">
          <div className="flex justify-center lg:justify-start overflow-hidden rounded-lg">
            <div className="w-32 lg:w-64 rounded-lg overflow-hidden object-contain shadow-lg">
              <SpeciesProfilePictureViewer
                taxonID={ncbiTaxonID}
                imageStatus={imageStatus}
              />
            </div>
          </div>
        </div>
        <div className="w-full">
          {generalInfos
            .sort((a, b) => (a.generalInfoLabel < b.generalInfoLabel ? -1 : 0))
            .map((generalInfo, index) => {
              if (
                index === taxonGeneralInfoCarouselIndex ||
                taxonGeneralInfoCarouselIndex === -1
              ) {
                return (
                  <div
                    key={generalInfo.generalInfoLabel + index}
                    className={
                      taxonGeneralInfoCarouselIndex !== -1
                        ? "lg:flex lg:px-4 py-4 rounded-lg w-full bg-white lg:shadow-lg my-4 items-center animate-grow-y lg:min-h-48"
                        : "lg:flex lg:px-4 py-4 rounded-lg w-full bg-white lg:shadow-lg my-4 items-center animate-grow-y lg:min-h-48"
                    }
                  >
                    <div className="flex justify-center lg:justify-start items-center w-full text-center lg:w-1/5 h-full text-xs lg:text-base lg:font-semibold font-bold rounded p-4">
                      {generalInfo.generalInfoLabel}
                    </div>
                    <div className="flex items-center lg:w-4/5 text-justify text-xs lg:text-sm lg:border-l-4 px-8 py-4 rounded-lg lg:border-t lg:border-b">
                      {generalInfo.generalInfoDescription}
                    </div>
                  </div>
                );
              } else {
                return <div key={generalInfo.generalInfoLabel + index} />;
              }
            })}
        </div>
      </div>
      <div className="flex justify-between items-center mx-20">
        <div className="flex justify-between shadow rounded-full bg-white">
          <div className="px-2">
            <Button
              color="link"
              size="sm"
              onClick={() =>
                setTaxonGeneralInfoCarouselIndex((prevState) =>
                  prevState - 1 > 0 ? prevState - 1 : generalInfos.length - 1
                )
              }
            >
              <CaretPrevious
                size="small"
                color="blank"
                className="stroke-current"
              />
            </Button>
          </div>
          <div className="px-2">
            <Button
              color="link"
              size="sm"
              onClick={() => handlePauseTaxonGeneralInfoInterval()}
            >
              {taxonGeneralInfoInterval ? (
                <Pause
                  size="small"
                  color="blank"
                  className="stroke-current animate-grow-y"
                />
              ) : (
                <Play
                  size="small"
                  color="blank"
                  className="stroke-current animate-grow-y"
                />
              )}
            </Button>
          </div>
          <div className="px-2">
            <Button
              color="link"
              size="sm"
              onClick={() =>
                setTaxonGeneralInfoCarouselIndex((prevState) =>
                  prevState + 1 < generalInfos.length ? prevState + 1 : 0
                )
              }
            >
              <CaretNext
                size="small"
                color="blank"
                className="stroke-current"
              />
            </Button>
          </div>
        </div>
        <div className="px-2 flex justify-between shadow rounded-full bg-white">
          <Button color="link" onClick={() => handleShowAll()}>
            {taxonGeneralInfoCarouselIndex !== -1 ? (
              <Down size="small" color="blank" className="stroke-current" />
            ) : (
              <Up size="small" color="blank" className="stroke-current" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformationCarousel;
