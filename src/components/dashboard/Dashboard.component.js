import React, { useContext, useEffect, useState } from "react";
import {
  DashboardContainer,
  HeaderContainer,
  Header,
  ButtonsContainer,
  RefreshButton,
  RefreshIcon,
  DownloadButton,
  DownloadIcon,
  SubHeadingContainer,
  HashtagContainer,
  PurpleCircle,
  HashtagText,
  CompareContainer,
  PurplePlus,
  CompareKeywordText,
  SaveSearchContainer,
  HeartIcon,
  SaveSerchText,
  BarIcon,
  DisabledContainer,
  FolderIcon,
  DisabledText,
  RightContainer,
  LeftContainer,
  SelectionContainer,
  FiltersContainer,
  DateContainer,
  SelectionHeading,
  FilterItem,
  MoreItem,
  CountBox,
  FilterItemsRow,
  DurationBtn,
  DateItemRow,
  DurationBtnSelected,
  DateInputContainer,
  DateInput,
  CrossIcon,
  CrossBtn,
  IconContainer,
  EditIcon,
  DeleteIcon,
  FilterCheckbox,
  CheckBoxLabel,
  FilterItemContainer,
  FilterItemDropdown,
  ApplyBtnMedium,
  SentimentFilterFooterContainer,
  BackIcon,
  BackContainer,
  BackText,
  CompareKeywordInput,
} from "./Dashboard.styles";
import Navbar from "../navbar/Navbar.component";
import SaveSearchModal from "../saveSearchModal/SaveSearchModal.component";
import MySearchModal from "../mySearchesModal/MySearchesModal.component";
import { Outlet } from "react-router-dom";
import TopThemes from "../top-themes/TopThemes";
import { CompareKeywordContext } from "../../contexts/CompareKeyword.context";
import { SavedSearchesContext } from "../../contexts/SavedSearches.context";
import EditCompareKeywordModal from "../editCompareKeywordModal/EditCompareKeywordModal.component";
import zIndex from "@mui/material/styles/zIndex";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from "../date-range/DateRange.component";
import { API_URL } from "../../utils/api";
import axios from "axios";
import { useCookies } from "react-cookie";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-toastify";


export const savedSearches = [];

// generate random posts
const generateMockData = (numberOfPosts) => {
  const mockData = [];
  for (let i = 0; i < numberOfPosts; i++) {
    mockData.push({
      id: i,
      content: `Post content ${i}`,
      sentiment: ["positive", "negative", "neutral"][
        Math.floor(Math.random() * 3)
      ],
      language: ["English", "Spanish", "French"][Math.floor(Math.random() * 3)],
      date: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28)
      ),
    });
  }
  return mockData;
};

// Component to show the data analytics of one keyword
const Dashboard = () => {

  // displaying filters clicked by the user
  const FilterApplicationFooter = ({ filterType }) => {
    let togglefnc = null;
    if (filterType == "sentiment") togglefnc = toggleSentimentCheckboxes;
    else if (filterType == "language") togglefnc = toggleLanguageCheckboxes;
    else if (filterType == "device") togglefnc = toggleDevicesCheckboxes;
    else if (filterType == "age") togglefnc = toggleAgeCheckboxes;
    else if (filterType == "gender") togglefnc = toggleGenderCheckboxes;
    return (
      <SentimentFilterFooterContainer>
        <CrossBtn onClick={togglefnc}>
          <CrossIcon src="/cross-svgrepo-com.svg" />
        </CrossBtn>
        <ApplyBtnMedium>Apply</ApplyBtnMedium>
      </SentimentFilterFooterContainer>
    );
  };

  const {
    data,
    deleteDataByName,
    filters: contextFilters,
    setFilters: setContextFilters,
    clearFilters,
  } = useContext(CompareKeywordContext);

  const [timeRange, setTimeRange] = useState("1d"); // default time range of last 24 hours

  const { mySavedSearches, setMySavedSearches } =
    useContext(SavedSearchesContext);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [showMySeachesModal, setShowMySearchesModal] = useState(false);
  const [showCompareKeywordEditModal, setShowCompareKeywordEditModal] =
    useState(false);
  const [showSentimentCheckboxes, setShowSentimentCheckboxes] = useState(false);
  const [showLanguageCheckboxes, setShowLanguageCheckboxes] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showDevicesCheckboxes, setShowDevicesCheckboxes] = useState(false);
  const [showAgeCheckboxes, setShowAgeCheckboxes] = useState(false);
  const [showGenderCheckboxes, setShowGenderCheckboxes] = useState(false);

  const [saveSearches, setSaveSearches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentEditingSearch, setCurrentEditingSearch] = useState(null);
  const [filters, setFilters] = useState({
    sentiment: "",
    language: "",
    date: "",
  });

  const [cookies] = useCookies(["token"]);

  // Reflect the results of updated filter values 
  const handleSentimentChange = (sentiment, isChecked) => {
    const newSentimentType = isChecked
      ? [...contextFilters.sentimentType, sentiment] // Add sentiment if checked
      : contextFilters.sentimentType.filter((type) => type !== sentiment); // Remove sentiment if not checked

    setContextFilters({ ...contextFilters, sentimentType: newSentimentType });
  };
  const handleLanguageChange = (language, isChecked) => {
    const newLanguage = isChecked
      ? [...contextFilters.language, language] // Add language if checked
      : contextFilters.language.filter((lang) => lang !== language); // Remove language if not checked

    setContextFilters({ ...contextFilters, language: newLanguage });
  };
  const handleDeviceChange = (device, isChecked) => {
    const newDevice = isChecked
      ? [...contextFilters.devices, device] // Add language if checked
      : contextFilters.devices.filter((dev) => dev !== device); // Remove language if not checked

    setContextFilters({ ...contextFilters, devices: newDevice });
  };
  const handleGenderChange = (gender, isChecked) => {
    const newGender = isChecked
      ? [...contextFilters.genders, gender] // Add language if checked
      : contextFilters.genders.filter((dev) => dev !== gender); // Remove language if not checked

    setContextFilters({ ...contextFilters, genders: newGender });
  };
  const handleAgeChange = (age, isChecked) => {
    const newAge = isChecked
      ? [...contextFilters.age, age] // Add age if checked
      : contextFilters.age.filter((a) => a !== age); // Remove age if not checked

    setContextFilters({ ...contextFilters, age: newAge });
  };


  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mockPosts = generateMockData(50); // Generate 50 mock posts
    setPosts(mockPosts);
    setFilteredPosts(mockPosts);
  }, []);

  useEffect(() => {
    // apply filters on posts
    const filtered = posts.filter((post) => {
      return (
        (filters.sentiment ? post.sentiment === filters.sentiment : true) &&
        (filters.language ? post.language === filters.language : true) &&
        (filters.date
          ? post.date.toISOString().split("T")[0] === filters.date
          : true)
      );
    });
    setFilteredPosts(filtered);
  }, [filters, posts]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  function formatDate(date) {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function addToDataset(name, eventNames, eventQueries) {
    const newEntry = {
      id: String(Math.floor(Date.now() / 1000)),
      name: name,
      date: formatDate(new Date()), // Gets today's date in the specified format
      region: "none",
      hashtags: eventQueries,
      labels: eventNames,
    };

    setMySavedSearches([...mySavedSearches, newEntry]);
    handleSaveSearchClose(); // Closes the modal
  }

  // visiblilty handling of new keyword entry 
  const handleCompareKeywordEditClose = () =>
    setShowCompareKeywordEditModal(false);
  const handleCompareKeywordEditShow = (currentSearchName) => {
    setShowCompareKeywordEditModal(true);
    setCurrentEditingSearch(currentSearchName);
  };

  // show or hide the save search modal
  const handleSaveSearchClose = () => setShowSaveSearchModal(false);
  const handleSaveSearchShow = () => setShowSaveSearchModal(true);

  // show or hide user's searches modal
  const handleMySearchesClose = () => setShowMySearchesModal(false);
  const handleMySearchesShow = () => setShowMySearchesModal(true);

  // update visiblility of filters
  const toggleSentimentCheckboxes = () => {
    setShowSentimentCheckboxes(!showSentimentCheckboxes);
  };
  const toggleLanguageCheckboxes = () => {
    setShowLanguageCheckboxes(!showLanguageCheckboxes);
  };
  const toggleDevicesCheckboxes = () => {
    setShowDevicesCheckboxes(!showDevicesCheckboxes);
  };
  const toggleAgeCheckboxes = () => {
    setShowAgeCheckboxes(!showAgeCheckboxes);
  };
  const toggleGenderCheckboxes = () => {
    setShowGenderCheckboxes(!showGenderCheckboxes);
  };

  // Edit a user's saved search
  const handleEditSearch = async (id, name) => {
    try {
      const token = cookies.token;
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const data = {
        userId: userId,
        searchId: id,
        name: name, 
      };
  
      const response = await axios.put(`${API_URL}/search/updateSearch`, data, {
        withCredentials: true,
      });
  
      if (response.status === 200) {
        console.log("Saved Search Updated Successfully");
  
        // Update the name of the search in the local state
        const updatedSearches = mySavedSearches.map((search) =>
          search.id === id ? { ...search, name: name } : search
        );
        setMySavedSearches(updatedSearches);
      }
    } catch (error) {
      console.error("Error Updating search:", error);
      toast.error("Saved Search could not be Updated", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        style: { fontSize: "1.3rem" },
      });
    }

  };

  // delete a user's saved search
  const handleDeleteSearch = async (id) => {
    try {
      const token = cookies.token;
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      console.log("userId", userId);
      console.log("SearchId", id);
      const data = {
        userId: userId,
        searchId: id,
      };
  
      const response = await axios.delete(`${API_URL}/search/deleteSearch`, {
        data: data, // Pass data as the 'data' property
        withCredentials: true,
        
      });
  
      if (response.status === 200) {
        console.log("Search Deleted Successfully");

        const updatedSearches = mySavedSearches.filter(
          (search) => search.id !== id
        );
        setMySavedSearches(updatedSearches);
      }
    } catch (error) {
      console.error("Error deleting search:", error);
      toast.error("Search could not be deleted", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        style: { fontSize: "1.3rem" },
      });    }  };
  
  // remove a keyword's analytics from dashboard
  const handleDeleteCompareSearch = (searchName) => {
    const indexToRemove = contextFilters.eventNames.findIndex(
      (item) => item === searchName
    );

    if (indexToRemove !== -1) {
      const updatedEventNames = contextFilters.eventNames.filter(
        (_, index) => index !== indexToRemove
      );
      const updatedEventQueries = contextFilters.eventQueries.filter(
        (_, index) => index !== indexToRemove
      );

      if (contextFilters.eventNames.length <= 2) {
        setContextFilters({
          ...contextFilters,
          eventNames: updatedEventNames,
          eventQueries: updatedEventQueries,
        });

        navigate("/dashboard");
      }
      // deleteDataByName(searchName)
      setContextFilters({
        ...contextFilters,
        eventNames: updatedEventNames,
        eventQueries: updatedEventQueries,
      });
    }
  };

  const [compareEditMode, setCompareEditMode] = useState(false);
  const [compareInputValue, setCompareInputValue] = useState("");

  // enter another keyword to show its analytics
  const handleCompareInputSubmit = (e) => {
    let zeroSearches = false;
    if (contextFilters.eventNames.length == 0) zeroSearches = true;
    if (e.key === "Enter") {
      console.log("Event names:", typeof contextFilters.eventNames);
      console.log("Submitted value:", compareInputValue);
      // You can also toggle editMode off if needed
      setCompareEditMode(false);
      setContextFilters({
        ...contextFilters,
        eventNames: [...contextFilters.eventNames, compareInputValue],
        eventQueries: [...contextFilters.eventQueries, compareInputValue],
      });

      if (!zeroSearches) {
        navigate("compare-keyword");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#6937F2" }}>
      <Navbar />

      <DashboardContainer>
        {/* <BackContainer>
        <BackIcon src="/back-svgrepo-com.svg" onClick={() => {location.pathname == '/dashboard' ? navigate('/'): navigate('/dashboard')}}/>
        <BackText onClick={() => {location.pathname == '/dashboard' ? navigate('/'): navigate('/dashboard')}}>{location.pathname == '/dashboard' ? "Search": "Dashboard"}</BackText>
        </BackContainer> */}

        <HeaderContainer>
          <Header>Listening Analysis</Header>
          <ButtonsContainer>
            <RefreshButton>
              <RefreshIcon src="/refresh-cw-svgrepo-com.svg" />
            </RefreshButton>
            <DownloadButton>
              <DownloadIcon src="/download-minimalistic-svgrepo-com.svg" />{" "}
              Download
            </DownloadButton>
          </ButtonsContainer>
        </HeaderContainer>
        <SubHeadingContainer>
          <LeftContainer>
            {data.map((item) => (
              <HashtagContainer>
                <PurpleCircle src="/purple-circle-svgrepo-com.svg" />
                <HashtagText>{item.name}</HashtagText>
                <IconContainer className="icon-container">
                  <EditIcon
                    onClick={() => handleCompareKeywordEditShow(item.name)}
                  />
                  {currentEditingSearch === item.name && (
                    <EditCompareKeywordModal
                      show={showCompareKeywordEditModal}
                      handleClose={handleCompareKeywordEditClose}
                      currentHashtag={item.name}
                    />
                  )}
                  <DeleteIcon
                    onClick={() => handleDeleteCompareSearch(item.name)}
                  />
                </IconContainer>
              </HashtagContainer>
            ))}

            <div>
              {compareEditMode ? (
                <div>
                  <CompareKeywordInput
                    type="text"
                    onBlur={() => setCompareEditMode(false)}
                    onChange={(e) => {
                      setCompareInputValue(e.target.value);
                    }}
                    onKeyDown={handleCompareInputSubmit}
                    autoFocus
                  />
                </div>
              ) : (
                <CompareContainer
                  onClick={() => {
                    setCompareEditMode(true);
                  }}
                >
                  <PurplePlus src="/plus-large-svgrepo-com.svg" />
                  <CompareKeywordText>Compare keyword</CompareKeywordText>
                </CompareContainer>
              )}
            </div>
          </LeftContainer>
          <RightContainer>
            <SaveSearchContainer onClick={handleSaveSearchShow}>
              <HeartIcon src="/heart-svgrepo-com.svg" />
              <SaveSerchText>Save Search</SaveSerchText>
            </SaveSearchContainer>
            <SaveSearchModal
              show={showSaveSearchModal}
              handleClose={handleSaveSearchClose}
              addToDataset={addToDataset}
            />
            <BarIcon src="/bar-svgrepo-com.svg" />
            <DisabledContainer onClick={handleMySearchesShow}>
              <FolderIcon src="/folder-svgrepo-com.svg" />
              <DisabledText>My Searches</DisabledText>
            </DisabledContainer>
            <MySearchModal
              show={showMySeachesModal}
              handleClose={handleMySearchesClose}
              saveSearches={mySavedSearches}
              handleEditSearch={handleEditSearch}
              handleDeleteSearch={handleDeleteSearch}
            />
          </RightContainer>
        </SubHeadingContainer>
        <SelectionContainer>
          <FiltersContainer>
            <SelectionHeading>Filters</SelectionHeading>
            <FilterItemsRow>
              <FilterItemContainer>
                <FilterItem onClick={toggleSentimentCheckboxes}>
                  Sentiments <CountBox>2</CountBox>
                </FilterItem>
                {showSentimentCheckboxes && (
                  <FilterItemDropdown>
                    <FilterCheckbox>
                      <input
                        type="checkbox"
                        id="Positive"
                        defaultChecked={contextFilters.sentimentType.includes(
                          "Positive"
                        )}
                        onChange={(e) =>
                          handleSentimentChange("Positive", e.target.checked)
                        }
                      />
                      <CheckBoxLabel htmlFor="Positive">Positive</CheckBoxLabel>
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input
                        type="checkbox"
                        id="Negative"
                        defaultChecked={contextFilters.sentimentType.includes(
                          "Negative"
                        )}
                        onChange={(e) =>
                          handleSentimentChange("Negative", e.target.checked)
                        }
                      />
                      <CheckBoxLabel htmlFor="Negative">Negative</CheckBoxLabel>
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input
                        type="checkbox"
                        id="neutral"
                        defaultChecked={contextFilters.sentimentType.includes(
                          "Neutral"
                        )}
                        onChange={(e) =>
                          handleSentimentChange("Neutral", e.target.checked)
                        }
                      />
                      <CheckBoxLabel htmlFor="Neutral">Neutral</CheckBoxLabel>
                    </FilterCheckbox>
                    <FilterApplicationFooter filterType={"sentiment"} />
                  </FilterItemDropdown>
                )}
              </FilterItemContainer>
              {/* <FilterItem>
                Media type <CountBox>2</CountBox>
              </FilterItem> */}
              <FilterItemContainer>
                <FilterItem onClick={toggleLanguageCheckboxes}>
                  Language <CountBox>3</CountBox>
                </FilterItem>
                {showLanguageCheckboxes && (
                  <FilterItemDropdown>
                    <FilterCheckbox>
                      <input
                        type="checkbox"
                        id="ur"
                        defaultChecked={contextFilters.language.includes("ur")}
                        onChange={(e) =>
                          handleLanguageChange("ur", e.target.checked)
                        }
                      />
                      <CheckBoxLabel htmlFor="ur">Urdu</CheckBoxLabel>
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input
                        type="checkbox"
                        id="en"
                        defaultChecked={contextFilters.language.includes("en")}
                        onChange={(e) =>
                          handleLanguageChange("en", e.target.checked)
                        }
                      />
                      <CheckBoxLabel htmlFor="en">English</CheckBoxLabel>
                    </FilterCheckbox>
                    <FilterApplicationFooter filterType={"language"} />
                  </FilterItemDropdown>
                )}
              </FilterItemContainer>
              <FilterItem>
                Pakistan <CountBox>1</CountBox>
              </FilterItem>

              {isMoreOpen && (
                <>
                  <FilterItem>
                    Twitter <CountBox>1</CountBox>
                  </FilterItem>
                  <FilterItemContainer>
                    <FilterItem onClick={toggleAgeCheckboxes}>
                      Age <CountBox>3</CountBox>
                    </FilterItem>
                    {showAgeCheckboxes && (
                      <FilterItemDropdown>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="18-24"
                            defaultChecked={contextFilters.age.includes(
                              "18-24"
                            )}
                            onChange={(e) =>
                              handleAgeChange("18-24", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="18-24">18-24</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="25-34"
                            defaultChecked={contextFilters.age.includes(
                              "25-34"
                            )}
                            onChange={(e) =>
                              handleAgeChange("25-34", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="25-34">25-34</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="35-44"
                            defaultChecked={contextFilters.age.includes(
                              "35-44"
                            )}
                            onChange={(e) =>
                              handleAgeChange("35-44", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="35-44">35-44</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="45-54"
                            defaultChecked={contextFilters.age.includes(
                              "45-54"
                            )}
                            onChange={(e) =>
                              handleAgeChange("45-54", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="45-54">45-54</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="55-64"
                            defaultChecked={contextFilters.age.includes(
                              "55-64"
                            )}
                            onChange={(e) =>
                              handleAgeChange("55-64", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="55-64">55-64</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="65+"
                            defaultChecked={contextFilters.age.includes("65+")}
                            onChange={(e) =>
                              handleAgeChange("65+", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="65+">65+</CheckBoxLabel>
                        </FilterCheckbox>

                        <FilterApplicationFooter filterType={"age"} />
                      </FilterItemDropdown>
                    )}
                  </FilterItemContainer>
                  <FilterItemContainer>
                    <FilterItem onClick={toggleGenderCheckboxes}>
                      Gender <CountBox>3</CountBox>
                    </FilterItem>
                    {showGenderCheckboxes && (
                      <FilterItemDropdown>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="Male"
                            defaultChecked={contextFilters.genders.includes(
                              "Male"
                            )}
                            onChange={(e) =>
                              handleGenderChange("Male", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="Male">Male</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="Female"
                            defaultChecked={contextFilters.genders.includes(
                              "Female"
                            )}
                            onChange={(e) =>
                              handleGenderChange("Female", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="Female">Female</CheckBoxLabel>
                        </FilterCheckbox>

                        <FilterApplicationFooter filterType={"gender"} />
                      </FilterItemDropdown>
                    )}
                  </FilterItemContainer>
                  <FilterItemContainer>
                    <FilterItem onClick={toggleDevicesCheckboxes}>
                      Devices <CountBox>3</CountBox>
                    </FilterItem>
                    {showDevicesCheckboxes && (
                      <FilterItemDropdown>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="mobile"
                            defaultChecked={contextFilters.devices.includes(
                              "mobile"
                            )}
                            onChange={(e) =>
                              handleDeviceChange("mobile", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="mobile">Mobile</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="desktop"
                            defaultChecked={contextFilters.devices.includes(
                              "desktop"
                            )}
                            onChange={(e) =>
                              handleDeviceChange("desktop", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="desktop">
                            Desktop
                          </CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterCheckbox>
                          <input
                            type="checkbox"
                            id="tablet"
                            defaultChecked={contextFilters.devices.includes(
                              "tablet"
                            )}
                            onChange={(e) =>
                              handleDeviceChange("tablet", e.target.checked)
                            }
                          />
                          <CheckBoxLabel htmlFor="tablet">Tablet</CheckBoxLabel>
                        </FilterCheckbox>
                        <FilterApplicationFooter filterType={"device"} />
                      </FilterItemDropdown>
                    )}
                  </FilterItemContainer>
                </>
              )}
              <MoreItem onClick={() => setIsMoreOpen((prev) => !prev)}>
                <PurplePlus src="/plus-large-svgrepo-com.svg" />
                {!isMoreOpen ? "More" : "Less"}
              </MoreItem>

              <MoreItem onClick={clearFilters}>
                <PurplePlus src="/cross-svgrepo-com.svg" />
                Clear Filters
              </MoreItem>
            </FilterItemsRow>
          </FiltersContainer>
          <DateContainer>
            <SelectionHeading style={{ paddingLeft: "50px" }}>
              Date
            </SelectionHeading>
            <DateItemRow>
              <CrossBtn>
                <CrossIcon src="/cross-svgrepo-com.svg" />
              </CrossBtn>
              <BarIcon src="/bar-svgrepo-com.svg" />

              {contextFilters.timeRange === "1d" ? (
                <DurationBtnSelected>1d</DurationBtnSelected>
              ) : (
                <DurationBtn
                  onClick={() => {
                    setContextFilters({ ...contextFilters, timeRange: "1d" });
                    setTimeRange("1d");
                  }}
                >
                  1d
                </DurationBtn>
              )}
              {contextFilters.timeRange === "7d" ? (
                <DurationBtnSelected>7d</DurationBtnSelected>
              ) : (
                <DurationBtn
                  onClick={() => {
                    setContextFilters({ ...contextFilters, timeRange: "7d" });
                    setTimeRange("7d");
                  }}
                >
                  7d
                </DurationBtn>
              )}
              {contextFilters.timeRange === "1M" ? (
                <DurationBtnSelected>1M</DurationBtnSelected>
              ) : (
                <DurationBtn
                  onClick={() => {
                    setContextFilters({ ...contextFilters, timeRange: "1M" });
                    setTimeRange("1M");
                  }}
                >
                  1M
                </DurationBtn>
              )}

              <DateInputContainer>
                {/* <DateInput
                  onChange={(e) =>
                    setContextFilters({
                      ...contextFilters,
                      date: e.target.value,
                    })
                  }
                /> */}
                <DatePicker
                  selected={contextFilters.date.startDate}
                  onChange={(update) => {
                    setContextFilters({
                      ...contextFilters,
                      date: {
                        startDate: update[0] || update,
                        endDate: update[1],
                      },
                    });
                  }}
                  startDate={contextFilters.date.startDate}
                  endDate={contextFilters.date.endDate}
                  selectsRange
                  inline={false}
                  customInput={<DateRange />}
                />
              </DateInputContainer>
            </DateItemRow>
          </DateContainer>
        </SelectionContainer>

        <Outlet />
        <TopThemes timeRange={timeRange} />
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;
