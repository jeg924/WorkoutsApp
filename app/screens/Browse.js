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
} from "react-native";
import { SearchBar } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import MyButton from "../components/Button";
import { FlatList } from "react-native-gesture-handler";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";

// Search all workouts
// Search all users
// Search all programs

const SearchBox = connectSearchBox(({ currentRefinement, refine }) => (
  <View style={{ width: "90%", margin: 10 }}>
    <SearchBar
      inputStyle={{ backgroundColor: "white" }}
      containerStyle={{ backgroundColor: "white" }}
      leftIconContainerStyle={{ backgroundColor: "white" }}
      rightIconContainerStyle={{ backgroundColor: "white" }}
      inputContainerStyle={{ backgroundColor: "white" }}
      value={currentRefinement}
      onChangeText={(text) => refine(text)}
      placeholder="type here"
    />
  </View>
));

const InfiniteHits = connectInfiniteHits(({ hits, navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={hits}
        renderItem={({ item }) => {
          return item.type === "user" ? (
            <TouchableHighlight
              onPress={() => {
                navigation.navigate("Profile", {
                  userID: item.objectID,
                  edited: 0,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderWidth: 1,
                  padding: 10,
                }}
              >
                <Image
                  source={{ uri: item.photoURL, cache: "force-cache" }}
                  style={{ width: 40, height: 40 }}
                />
                <View style={{ marginLeft: 10, width: 250 }}>
                  <Text style={{ fontWeight: "bold" }}>{item.displayName}</Text>
                  <Text>User</Text>
                </View>
                <View style={{}}>
                  <Feather name="chevron-right" size={30} />
                </View>
              </View>
            </TouchableHighlight>
          ) : (
            // this is a workout
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("Start Workout", {
                  workoutID: item.workoutID,
                  current: 0,
                })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderWidth: 1,
                  padding: 10,
                }}
              >
                <Image
                  source={{ uri: item.workoutImage, cache: "force-cache" }}
                  style={{ width: 40, height: 40 }}
                />
                <View style={{ marginLeft: 10, width: 250 }}>
                  <Text style={{ fontWeight: "bold" }}>{item.workoutName}</Text>
                </View>
                <View style={{}}>
                  <Feather name="chevron-right" size={30} />
                </View>
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
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "bold", fontSize: 40, margin: 10 }}>
          Search
        </Text>
        <TouchableHighlight
          onPress={() => {
            navigation.navigate("Filter Form");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              marginRight: 20,
            }}
          >
            <Text style={{ fontSize: 20 }}>Filter </Text>
            <Feather name="filter" color="black" size={20} />
          </View>
        </TouchableHighlight>
      </View>

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
  );
}
