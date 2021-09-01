import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableHighlight,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { SearchBar } from "react-native-elements";
import SolidButton from "../components/SolidButton";

export default function ModalFriendPicker({ navigation, route }) {
  const {
    friends,
    friendsAverageStats,
    friendsBestStats,
    friendsLatestStats,
    updateFriend,
  } = route.params;
  const [query, setQuery] = React.useState("");
  const [filteredResults, setFilteredResults] = React.useState(friends);

  React.useEffect(() => {
    filter();
  }, [query]);

  function filter() {
    var filteredResults = friends;
    filteredResults = filteredResults.filter((friend) =>
      friend.displayName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(filteredResults);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: 20,
        }}
      >
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 8, justifyContent: "center" }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 30,
            }}
          >
            Search Friends
          </Text>
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
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
            value={query}
            onChangeText={(text) => {
              setQuery(text);
            }}
            placeholder="Search friends"
            round
          />
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={{ flex: 7 }}>
        <FlatList
          data={filteredResults}
          renderItem={({ item }) => {
            return (
              <TouchableHighlight
                onPress={() => {
                  var friendObject = {};
                  friendObject.userID = item.userID;
                  friendObject.displayName = item.displayName;
                  friendObject.profilePicture = item.profilePicture;
                  friendObject.hasStatsForThisWorkout = false;

                  for (let i = 0; i < friendsLatestStats.length; ++i) {
                    if (friendsLatestStats[i].userID === item.userID) {
                      friendObject.latestStats =
                        friendsLatestStats[i].exerciseInputData;
                      friendObject.hasStatsForThisWorkout = true;
                    }
                  }

                  for (let i = 0; i < friendsAverageStats.length; ++i) {
                    if (friendsAverageStats[i].userID === item.userID) {
                      friendObject.averageStats =
                        friendsAverageStats[i].exerciseInputData;
                    }
                  }

                  for (let i = 0; i < friendsBestStats.length; ++i) {
                    if (friendsBestStats[i].userID === item.userID) {
                      friendObject.bestStats =
                        friendsBestStats[i].exerciseInputData;
                    }
                  }

                  console.log("modal screen friend: ");
                  console.log(friendObject);

                  updateFriend(friendObject);
                  navigation.goBack();
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
                        source={{
                          uri: item.profilePicture,
                          cache: "force-cache",
                        }}
                        style={{ width: 60, height: 60, borderRadius: 100 }}
                      />
                    </View>
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flex: 10, justifyContent: "center" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {item.displayName}
                      </Text>
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
      <View
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "5%",
        }}
      >
        <SolidButton
          title="Dismiss"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    </View>
  );
}
