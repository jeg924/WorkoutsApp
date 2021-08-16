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
  ActionSheetIOS,
} from "react-native";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MyButton from "../components/Button";

export default function MyWorkouts({ navigation, route }) {
  const [loading, setLoading] = React.useState(false);
  const [deletingUpload, setDeletingUpload] = React.useState(false);
  const [myHistoryCategory, setMyHistoryCategory] = React.useState(false);
  const [myLibraryCategory, setMyLibraryCategory] = React.useState(false);
  const [myUploadsCategory, setMyUploadsCategory] = React.useState(true);
  const [uploads, setUploads] = React.useState(null);
  const [library, setLibrary] = React.useState(null);
  const [history, setHistory] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      loadData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    try {
      setLoading(true);
      // set uploads
      let uploads = [];
      const uploadsRef = firebase
        .firestore()
        .collection("workouts")
        .where("authorID", "==", firebase.auth().currentUser.uid)
        .where("deleted", "==", false);
      const uploadsDocs = await uploadsRef.get();
      uploadsDocs.forEach((doc) => {
        uploads.push(doc.data());
      });
      setUploads(uploads);
      // set library
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      if (my.library) {
        setLibrary(my.library);
      } else {
        setLibrary(null);
      }
      // set history
      if (my.history) {
        setHistory(my.history);
      } else {
        setHistory(null);
      }
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
      </View>
    );
  }

  if (deletingUpload) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Deleting Upload</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          position: "fixed",
          height: "auto",
          backgroundColor: "pink",
          marginTop: 20,
        }}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            My Workouts
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
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
                color: myHistoryCategory ? "blue" : "black",
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
                fontWeight: "bold",
                color: myLibraryCategory ? "blue" : "black",
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
                color: myUploadsCategory ? "blue" : "black",
              }}
            >
              Uploads
            </Text>
          </TouchableHighlight>
        </View>
      </View>
      <SafeAreaView
        style={{ flex: 4, backgroundColor: "cyan", alignItems: "center" }}
      >
        <FlatList
          style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: "green",
          }}
          data={
            myUploadsCategory ? uploads : myHistoryCategory ? history : library
          }
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => {
            return (
              <TouchableHighlight
                style={{ margin: 20 }}
                onPress={() => {
                  navigation.navigate("Start Workout", {
                    workoutID: item.workoutID,
                    current: 0,
                  });
                }}
                onLongPress={() => {
                  const options = ["start", "edit", "delete", "cancel"];
                  const destructiveButtonIndex = 2;
                  const cancelButtonIndex = 3;

                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options,
                      cancelButtonIndex,
                      destructiveButtonIndex,
                    },
                    async (buttenIndex) => {
                      if (buttenIndex == 0) {
                        navigation.navigate("Start Workout", {
                          workoutID: item.workoutID,
                          current: 0,
                        });
                      } else if (buttenIndex == 1) {
                        navigation.navigate("Workout Info Form", {
                          workoutID: item.workoutID,
                        });
                      } else if (buttenIndex == 2) {
                        setDeletingUpload(true);
                        const workoutRef = firebase
                          .firestore()
                          .collection("workouts")
                          .doc(item.workoutID);
                        workoutRef.update({
                          deleted: true,
                        });
                        const workoutExercisesRef = firebase
                          .firestore()
                          .collection("exercises")
                          .where("workoutID", "==", item.workoutID);
                        const batch = firebase.firestore().batch();
                        batch.update(workoutExercisesRef, { deleted: true });
                        await batch.commit();

                        setDeletingUpload(false);
                      }
                    }
                  );
                }}
              >
                <View>
                  <Image
                    style={{ width: 100, height: 100 }}
                    source={{ uri: item.workoutImage, cache: "force-cache" }}
                  />
                  <Text>{item.workoutName}</Text>
                </View>
              </TouchableHighlight>
            );
          }}
          numColumns={3}
        />
      </SafeAreaView>

      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "5%",
        }}
      >
        <MyButton
          title="Create Workout"
          onPress={() =>
            navigation.navigate("Workout Info Form", { workoutID: null })
          }
        />
      </View>
    </View>
  );
}
