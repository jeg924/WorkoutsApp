import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import {
  View,
  Text,
  Button,
  Image,
  TouchableHighlight,
  FlatList,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useCollectionData } from "react-firebase-hooks/firestore";

export default function MyWorkouts({ navigation, route }) {
  const [myHistoryCategory, setMyHistoryCategory] = React.useState(false);
  const [myLibraryCategory, setMyLibraryCategory] = React.useState(false);
  const [myUploadsCategory, setMyUploadsCategory] = React.useState(true);

  const [uploads, loading, error] = useCollectionData(
    firebase
      .firestore()
      .collection("workouts")
      .where("authorID", "==", firebase.auth().currentUser.uid)
  );
  const history = [];
  const library = [];
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          margin: 20,
          position: "fixed",
          height: "auto",
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          My Workouts
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5,
          }}
        >
          <TouchableHighlight
            onPress={() => {
              setMyHistoryCategory(true);
              setMyLibraryCategory(false);
              setMyUploadsCategory(false);
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: myHistoryCategory ? "orange" : "black",
              }}
            >
              History
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              setMyLibraryCategory(true);
              setMyHistoryCategory(false);
              setMyUploadsCategory(false);
            }}
          >
            <Text
              style={{
                paddingRight: 15,
                paddingLeft: 15,
                fontWeight: "bold",
                color: myLibraryCategory ? "orange" : "black",
              }}
            >
              Library
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              setMyUploadsCategory(true);
              setMyHistoryCategory(false);
              setMyLibraryCategory(false);
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: myUploadsCategory ? "orange" : "black",
              }}
            >
              Uploads
            </Text>
          </TouchableHighlight>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={
            myUploadsCategory ? uploads : myHistoryCategory ? history : library
          }
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() => {
                navigation.navigate("Start Workout", {
                  workoutID: item.workoutID,
                });
              }}
            >
              <ImageBackground
                style={{ width: 100, height: 100 }}
                source={item.workoutImage ? { uri: item.workoutImage } : null}
              >
                <Text>{item.workoutName}</Text>
              </ImageBackground>
            </TouchableHighlight>
          )}
          numColumns={2}
          style={{ padding: 10 }}
        />
      </View>

      <TouchableHighlight
        onPress={() => navigation.navigate("Workout Info Form", {})}
        style={{
          backgroundColor: "orange",
          borderRadius: "100%",
          width: "80%",
          padding: 10,
          margin: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Create a workout</Text>
      </TouchableHighlight>
    </View>
  );
}
