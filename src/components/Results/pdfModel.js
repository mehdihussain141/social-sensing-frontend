import React, { useEffect, useRef, useState } from "react";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Path,
  Image,
} from "@react-pdf/renderer";
import { HorizontalBarChartComponent } from "../horizontal-bar/HorizontalBarChart";
import VerticalBarChart from "../refreshBtn/vertical-bar/VerticalBarChart";
import html2canvas from "html2canvas";

const PdfModel = ({
  tweets,
  topResultMatch,
  topResultRange,
  topResultSentiment,
  closePdfModal,
}) => {
  const modalRef = useRef();

  const [chart1Image, setChart1Image] = useState(null);
  const [chart2Image, setChart2Image] = useState(null);

  useEffect(() => {
    const captureChart1 = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay time as needed
      const chart1Canvas = await html2canvas(document.getElementById('chart1-container'));
      const chart1ImageData = chart1Canvas.toDataURL('image/png');
      setChart1Image(chart1ImageData);
    };
  
    const captureChart2 = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay time as needed
      const chart2Canvas = await html2canvas(document.getElementById('chart2-container'));
      const chart2ImageData = chart2Canvas.toDataURL('image/png');
      setChart2Image(chart2ImageData);
    };
  
    captureChart1();
    captureChart2();
  }, []);

  // useEffect(() => {
  //   const captureChart1 = async () => {
  //     const chart1Canvas = await html2canvas(document.getElementById('chart1-container'));
  //     const chart1ImageData = chart1Canvas.toDataURL('image/png');
  //     setChart1Image(chart1ImageData);
  //   };

  //   const captureChart2 = async () => {
  //     const chart2Canvas = await html2canvas(document.getElementById('chart2-container'));
  //     const chart2ImageData = chart2Canvas.toDataURL('image/png');
  //     setChart2Image(chart2ImageData);
  //   };

  //   captureChart1();
  //   captureChart2();
  // }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (modalRef.current && !modalRef.current.contains(event.target)) {
  //       closePdfModal();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [closePdfModal]);

  let totalEngagement = 0;
  let totalReach = 0;
  tweets.forEach((tweet) => {
    totalEngagement += tweet[0].profileData.engagement;
    totalReach += tweet[0].profileData.reach;
  });

  const dataGraph = {
    labels: ["Reach", "Engagement"],
    datasets: [
      {
        label: "Reach",
        data: [totalReach, 0],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Engagement",
        data: [0, totalEngagement],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  tweets.forEach((tweet) => {
    switch (tweet[0].profileData.sentiment) {
      case "Positive":
        positiveCount++;
        break;
      case "Negative":
        negativeCount++;
        break;
      default:
        neutralCount++;
        break;
    }
  });

  const dataSentiments = {
    labels: [topResultMatch],
    datasets: [
      {
        label: "Postive",
        data: [positiveCount, 0],
        backgroundColor: "green",
        borderColor: "green",
        borderWidth: 1,
      },
      {
        label: "Negative",
        data: [negativeCount, 0],
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 1,
      },
      {
        label: "Neutral",
        data: [neutralCount, 0],
        backgroundColor: "blue",
        borderColor: "blue",
        borderWidth: 1,
      },
    ],
  };

  let filterText = "";
  if (topResultRange !== "none") {
    filterText += topResultRange;
  }
  if (topResultSentiment !== "none") {
    filterText += ` ${topResultSentiment}`;
  }

  const MyPdf = ({ tweets }) => {
    const pages = [];

    const StartingPage = () => {
      return (
        <Page size="A4" style={styles.pageStart}>
          <View >
            <Text style={styles.headerStart}>
              Walee-Social Sensing Export Results
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleStart}>
                Searched Hashtag: {topResultMatch}
              </Text>
              <Text style={styles.subtitleStart}>
                Filter Applied: {topResultRange}
              </Text>
            </View>
          </View>
          {chart1Image && (
            <View >
              <Image src={chart1Image} style={styles.chartImage} />
            </View>
          )}
          {chart2Image && (
            <View >
              <Image src={chart2Image} style={styles.chartImage} />
            </View>
          )}
          {renderFooter(1)}
        </Page>
      );
    };

    pages.push(<StartingPage />);

    for (let i = 0; i < tweets.length; i += 7) {
      const pageTweets = tweets.slice(i, i + 7);
      pages.push(
        <Page key={i} size="A4" style={styles.page}>
          {pageTweets.map((tweet, index) => (
            <View key={index} style={styles.tweetContainer}>
              <View style={styles.column}>
                <Text style={styles.smallText}>Tweeted</Text>
                <Text style={styles.text}>{tweet[0].profileData.content}</Text>
                <Text style={styles.smallText}>
                  Published on {tweet[0].profileData.timePublished} |{" "}
                  {tweet[0].profileData.platform} |{" "}
                  {tweet[0].profileData.location} | {tweet[0].profileData.name}
                </Text>
              </View>
              <View style={styles.secondColumn}>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Matches: {tweet[0].profileData.matches}
                </Text>
                <Text
                  style={[
                    styles.smallText,
                    styles.smallerText,
                    sentimentColor(tweet[0].profileData.sentiment),
                  ]}
                >
                  Sentiment: {tweet[0].profileData.sentiment}
                </Text>
                <Text
                  style={[
                    styles.smallText,
                    styles.boldText,
                    styles.smallerText,
                  ]}
                >
                  Engagement: {tweet[0].profileData.engagement}
                </Text>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Potential Reach: {tweet[0].profileData.reach}
                </Text>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Retweets: {tweet[0].additionalMetrics.shares}
                </Text>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Twitter Likes: {tweet[0].additionalMetrics.hearts}
                </Text>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Users: {tweet[0].additionalMetrics.users}
                </Text>
                <Text style={[styles.smallText, styles.smallerText]}>
                  Trending Post: {tweet[0].profileData.trending}
                </Text>
              </View>
            </View>
          ))}
          {renderFooter(i / 7 + 2)}
        </Page>
      );
    }

    return <Document>{pages}</Document>;
  };

  const renderFooter = (pageNumber) => {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerTextLeft}>WALEE-SOCIAL SENSING </Text>
        <Text style={styles.footerTextRight}>Page {pageNumber}</Text>
      </View>
    );
  };

  const sentimentColor = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return styles.greenText;
      case "Negative":
        return styles.redText;
      default:
        return styles.blueText;
    }
  };

  const styles = StyleSheet.create({
    pageStart: {
      flexDirection: "column",
      padding: 30,
    },
    // border: {
    //   borderWidth: 1, 
    //   borderColor: "#000",
    // },
    headerStart: {
      textAlign: "center",
      fontSize: 24,
      fontWeight: "heavy",
      marginBottom: 15,
      color: "#1B95E0",
    },
    subtitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    subtitleStart: {
      fontSize: 16,
      fontWeight: "bold",
    },
    page: {
      flexDirection: "column",
      padding: 20,
    },
    tweetContainer: {
      marginBottom: 17,
      borderWidth: 1,
      borderColor: "#1B95E0",
      padding: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    column: {
      width: "70%",
      marginRight: "5%",
    },
    secondColumn: {
      width: "25%",
      marginRight: 0,
    },
    heading: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    text: {
      fontSize: 10,
      marginBottom: 5,
    },
    smallText: {
      fontSize: 10,
      color: "#777",
    },
    boldText: {
      fontWeight: "bold",
      color: "#000",
    },
    greenText: {
      color: "green",
    },
    redText: {
      color: "red",
    },
    blueText: {
      color: "blue",
    },
    smallerText: {
      fontSize: 8,
    },
    footer: {
      position: "absolute",
      marginLeft: 40,
      marginRight: 40,
      bottom: 15,
      left: 0,
      right: 0,
      backgroundColor: "#1B95E0",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: "#999",
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    footerTextLeft: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
    },
    footerTextRight: {
      fontSize: 10,
      color: "#fff",
    },
    modalContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      position: "relative",
      width: "50%",
      height: "99%",
      backgroundColor: "#ffffff",
      padding: 15,
    },
    mainHeading: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: "#1B95E0",
      padding: 0,
      margin: 0,
    },
    downloadLinkContainer: {
      position: "absolute",
      top: 19,
      right: 15,
      fontSize: 12,
      textDecoration: "none",
    },
    searchedHashtag: {
      position: "absolute",
      top: 50,
      left: 20,
      fontSize: 14,
      fontWeight: "bold",
    },
    filterApplied: {
      position: "absolute",
      top: 50,
      right: 20,
      fontSize: 14,
      fontWeight: "bold",
    },
    chartContainer1: {
      paddingTop: 14,
      width: "65%",
    },
    chartContainer2: {
      width: "65%",
    },
  });

  const buttonHandler = () => {
    closePdfModal();
  };

  return (
    <div ref={modalRef} style={styles.modalContainer}>
      <div style={styles.modalContent}>
        <div style={styles.downloadLinkContainer}>
          <PDFDownloadLink
            document={<MyPdf tweets={tweets} />}
            fileName="export.pdf"
          >
            {({ loading }) =>
              loading ? "Loading document..." : "Download PDF"
            }
          </PDFDownloadLink>
        </div>
        <div
          style={styles.searchedHashtag}
        >{`Searched Hashtag: ${topResultMatch}`}</div>
        <h2 style={styles.mainHeading}>Walee-Social Sensing Export Results</h2>
        {filterText && (
          <div
            style={styles.filterApplied}
          >{`Filter Applied: ${filterText}`}</div>
        )}

        <div style={styles.chartContainer1} >
          <div id="chart1-container">
          <HorizontalBarChartComponent
            title="Reach vs Engagement"
            data={dataGraph}
          />
          </div>
        </div>
        <div style={styles.chartContainer2} >
          <div id="chart2-container">
          <VerticalBarChart title="Sentiments" data={dataSentiments} />
          </div>
        </div>
      </div>
      <button onClick={buttonHandler}>close</button>
    </div>
  );
};

export default PdfModel;