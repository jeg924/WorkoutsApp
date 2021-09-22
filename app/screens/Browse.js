import React, { useEffect } from "react";
import firebase from "firebase";
import {
  Configure,
  InstantSearch,
  connectSearchBox,
  connectInfiniteHits,
  connectRefinementList,
} from "react-instantsearch-native";
import algoliasearch from "algoliasearch";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableHighlight,
  Image,
  Pressable,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import SolidButton from "../components/SolidButton";
import { FlatList } from "react-native-gesture-handler";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import Header from "../components/Header";

// Search all workouts
// Search all users
// Search all programs

const SearchBox = connectSearchBox(({ currentRefinement, refine }) => (
  <View style={{ flex: 1, flexDirection: "row" }}>
    <View style={{ flex: 1 }}></View>
    <View style={{ flex: 11 }}>
      <SearchBar
        containerStyle={{
          backgroundColor: "white",
          borderBottomColor: "white",
          borderTopColor: "white",
        }}
        searchIcon={{ size: 20 }}
        inputContainerStyle={{
          backgroundColor: "white",
          borderColor: "black",
          borderWidth: 1,
          borderBottomWidth: 1,
        }}
        value={currentRefinement}
        onChangeText={(text) => refine(text)}
        placeholder="Search for users or workouts"
        round
      />
    </View>
    <View style={{ flex: 1 }}></View>
  </View>
));

const InfiniteHits = connectInfiniteHits(({ hits, navigation }) => {
  return (
    <View style={{ flex: 7 }}>
      <FlatList
        style={{ flex: 1 }}
        data={hits}
        renderItem={({ item }) => {
          return item.type === "user" ? (
            <TouchableHighlight
              onPress={() => {
                navigation.navigate("Profile", {
                  userID: item.objectID,
                });
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                }}
              >
                <View style={{ flex: 1 }}></View>
                <View
                  style={{
                    flex: 8,
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      flex: 3,
                      width: 70,
                      height: 70,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item.photoURL, cache: "force-cache" }}
                      style={{ width: 60, height: 60, borderRadius: 100 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}></View>
                  <View style={{ flex: 10, justifyContent: "center" }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item.displayName}
                    </Text>
                    <Text>User</Text>
                  </View>
                  <View
                    style={{
                      flex: 2,
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}
                  >
                    <Feather name="chevron-right" size={30} />
                  </View>
                </View>
                <View style={{ flex: 0.8 }}></View>
              </View>
            </TouchableHighlight>
          ) : (
            // this is a workout
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("Start Workout", {
                  workoutID: item.workoutID,
                  current: 0,
                  routeRecordID: null,
                })
              }
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                }}
              >
                <View style={{ flex: 1 }}></View>
                <View
                  style={{
                    flex: 8,
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      flex: 3,
                      width: 70,
                      height: 70,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item.workoutImage, cache: "force-cache" }}
                      style={{ width: 60, height: 60 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}></View>
                  <View style={{ flex: 10, justifyContent: "center" }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item.workoutName}
                    </Text>
                    <Text>Workout</Text>
                  </View>
                  <View
                    style={{
                      flex: 2,
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}
                  >
                    <Feather name="chevron-right" size={30} />
                  </View>
                </View>
                <View style={{ flex: 0.8 }}></View>
              </View>
            </TouchableHighlight>
          );
        }}
      />
    </View>
  );
});

export default function Browse({ navigation, route }) {
  const filters = route.params;

  const [facetFilters, setFacetFilters] = React.useState(null);
  const [numericFilters, setNumericFilters] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(filterResults, [filters]);

  function filterResults() {
    setLoading(true);
    if (filters) {
      setFacetFilters(filters.facetFilters);
      setNumericFilters(filters.numericFilters);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header
        title="Browse"
        tabScreen
        headerButton={
          <Pressable
            onPress={() => {
              navigation.navigate("Filter Form");
            }}
          >
            <Feather name="filter" size={30} color="white" />
          </Pressable>
        }
      />
      <View style={{ flex: 8 }}>
        <InstantSearch
          searchClient={algoliasearch(
            "1F3XZA4W9N",
            "84e9912d9e5dd10b8075a7e003b2f421"
          )}
          indexName="searchIndex"
        >
          <SearchBox />
          <InfiniteHits navigation={navigation} />
          {facetFilters || numericFilters ? (
            <Configure
              facetFilters={facetFilters}
              numericFilters={numericFilters}
            />
          ) : null}
        </InstantSearch>
      </View>
    </View>
  );
}
