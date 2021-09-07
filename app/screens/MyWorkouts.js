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
import SolidButton from "../components/SolidButton";

export default function MyWorkouts({ navigation, route }) {
  const [loading, setLoading] = React.useState(false);
  const [deletingUpload, setDeletingUpload] = React.useState(false);
  const [myHistoryCategory, setMyHistoryCategory] = React.useState(false);
  const [myLibraryCategory, setMyLibraryCategory] = React.useState(false);
  const [myUploadsCategory, setMyUploadsCategory] = React.useState(true);
  const [uploads, setUploads] = React.useState([]);
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
        <Text>Loading aljflafjafjla</Text>
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
      }}
    >
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          position: "fixed",
          marginTop: 20,
          height: 120,
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
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
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
                  fontSize: 20,
                  color: myHistoryCategory ? "blue" : "black",
                  textDecorationLine: myHistoryCategory ? "underline" : "none",
                }}
              >
                History
              </Text>
            </TouchableHighlight>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
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
                  fontSize: 20,
                  color: myLibraryCategory ? "blue" : "black",
                  textDecorationLine: myLibraryCategory ? "underline" : "none",
                }}
              >
                Library
              </Text>
            </TouchableHighlight>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
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
                  fontSize: 20,
                  color: myUploadsCategory ? "blue" : "black",
                  textDecorationLine: myUploadsCategory ? "underline" : "none",
                }}
              >
                Uploads
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
      <SafeAreaView style={{ flex: 4, alignItems: "center" }}>
        {myUploadsCategory && !uploads.length ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                width: "50%",
                alignItems: "center",
                justifyContent: "flex-end",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18 }}>
                You haven't created any workouts yet.
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
              }}
            >
              <SolidButton
                title="Create Workout"
                onPress={() =>
                  navigation.navigate("Workout Info Form", { workoutID: null })
                }
              />
            </View>
          </View>
        ) : (
          <FlatList
            style={{
              flex: 1,
              width: "100%",
              flexDirection: "column",
            }}
            data={
              myUploadsCategory
                ? uploads
                : myHistoryCategory
                ? history
                : library
            }
            keyExtractor={(index) => index}
            renderItem={({ item }) => {
              return (
                <TouchableHighlight
                  style={{
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: "11.3%",
                    marginRight: "11.3%",
                  }}
                  onPress={() => {
                    navigation.navigate("Start Workout", {
                      workoutID: item.workoutID,
                      current: 0,
                    });
                  }}
                  onLongPress={() => {
                    const options = ["Start", "Edit", "Delete", "Cancel"];
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
                          try {
                            setDeletingUpload(true);
                            const batch = firebase.firestore().batch();
                            const workoutRef = firebase
                              .firestore()
                              .collection("workouts")
                              .doc(item.workoutID);
                            await workoutRef.update({
                              deleted: true,
                            });
                            const workoutExercisesRef = firebase
                              .firestore()
                              .collection("exercises")
                              .where("workoutID", "==", item.workoutID);
                            const workoutExercises =
                              await workoutExercisesRef.get();
                            workoutExercises.forEach((doc) => {
                              batch.update(doc.ref, { deleted: true });
                            });
                            await batch.commit();

                            loadData();
                          } catch (error) {
                            console.log("error is " + error);
                          } finally {
                            setDeletingUpload(false);
                          }
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
        )}
      </SafeAreaView>

      {myUploadsCategory && !uploads.length ? null : (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "5%",
          }}
        >
          <SolidButton
            title="Create Workout"
            onPress={() =>
              navigation.navigate("Workout Info Form", { workoutID: null })
            }
          />
        </View>
      )}
    </View>
  );
}
