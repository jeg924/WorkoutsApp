import React, { useReducer } from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {
  View,
  Text,
  Switch,
  SafeAreaView,
  TouchableHighlight,
  Image,
  Pressable,
} from "react-native";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Constants from "expo-constants";
import { Feather } from "@expo/vector-icons";
import Header from "../components/Header";
import Input from "../components/Input";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function WorkoutInfoForm({ navigation, route }) {
  const { workoutID } = route.params;

  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [workoutName, setWorkoutName] = React.useState("");
  const [workoutImage, setWorkoutImage] = React.useState(null);

  const [publicWorkout, setPublicWorkout] = React.useState(false);

  const [weightNeeded, setWeightNeeded] = React.useState(false);
  const [barNeeded, setBarNeeded] = React.useState(false);
  const [chairNeeded, setChairNeeded] = React.useState(false);
  const [matNeeded, setMatNeeded] = React.useState(false);
  const [towelNeeded, setTowelNeeded] = React.useState(false);

  const [strength, setStrength] = React.useState(false);
  const [cardio, setCardio] = React.useState(false);
  const [balance, setBalance] = React.useState(false);
  const [yoga, setYoga] = React.useState(false);
  const [speed, setSpeed] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadWorkoutData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadWorkoutData() {
    try {
      setLoading(true);
      if (workoutID) {
        const workoutRef = firebase
          .firestore()
          .collection("workouts")
          .doc(workoutID);
        const workoutDoc = await workoutRef.get();
        const workout = workoutDoc.data();
        if (workout) {
          setWorkoutName(workout.workoutName);
          setWorkoutImage(workout.workoutImage);

          setPublicWorkout(workout.public);

          setWeightNeeded(workout.isWeightNeeded);
          setBarNeeded(workout.isBarNeeded);
          setChairNeeded(workout.isChairNeeded);
          setMatNeeded(workout.isMatNeeded);
          setTowelNeeded(workout.isTowelNeeded);

          setStrength(workout.isStrength);
          setCardio(workout.isCardio);
          setYoga(workout.isYoga);
          setSpeed(workout.isSpeed);
          setBalance(workout.isBalance);

          Image.prefetch(workoutImage);
        }
      }
    } catch (error) {
      console.log("Error is " + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Submitting</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="Create a Workout" navigation={navigation} />
      <View style={{ flex: 11 }}>
        <ScrollView contentContainerStyle={{}}>
          <View style={{ height: 70, flexDirection: "row" }}>
            <View style={{ flex: 1 }}></View>
            {workoutImage ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: workoutImage, cache: "force-cache" }}
                  style={{ width: 50, height: 50 }}
                />
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/placeholder-image.png")}
                  style={{ width: 50, height: 50 }}
                />
              </View>
            )}
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flex: 7,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SecondaryButton
                onPress={async () => {
                  if (Constants.platform.ios) {
                    let { status } =
                      await ImagePicker.getCameraPermissionsAsync();
                    if (status !== "granted") {
                      status =
                        await ImagePicker.requestCameraPermissionsAsync();
                    }
                    if (status !== "granted") {
                      alert(
                        "Sorry, we need camera roll permissions to make this work!"
                      );
                    }
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 1,
                    });

                    if (!result.cancelled) {
                      setWorkoutImage(result.uri);
                    }
                  }
                }}
                title="Upload Cover Image"
              />
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View
            style={{
              height: 70,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 18 }}>
              <Input
                description="Workout Name"
                onChangeText={(x) => {
                  setWorkoutName(x);
                }}
                defaultValue={workoutName}
              />
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View
            style={{
              height: 70,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  setPublicWorkout(false);
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: !publicWorkout ? "blue" : "black",
                    textDecorationLine: !publicWorkout ? "underline" : "none",
                  }}
                >
                  Private
                </Text>
              </Pressable>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{" OR "}</Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  setPublicWorkout(true);
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: publicWorkout ? "blue" : "black",
                    textDecorationLine: publicWorkout ? "underline" : "none",
                  }}
                >
                  Public
                </Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View
            style={{
              height: 500,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 18 }}>
              <View style={{ height: 30 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Equipment Needed
                </Text>
              </View>
              <View style={{ height: 220 }}>
                <Pressable
                  onPress={() => {
                    setWeightNeeded(!weightNeeded);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={weightNeeded}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Weights or Bands"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBarNeeded(!barNeeded);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={barNeeded}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Pull up bar"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setChairNeeded(!chairNeeded);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={chairNeeded}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Chair or Bench"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMatNeeded(!matNeeded);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={matNeeded}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Mat or Carpet"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setTowelNeeded(!towelNeeded);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={towelNeeded}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Towel"}</Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ height: 30 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Category
                </Text>
              </View>
              <View style={{ height: 220 }}>
                <Pressable
                  onPress={() => {
                    setStrength(!strength);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={strength}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Strength/Bulk"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setCardio(!cardio);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={cardio}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Cardio/Lean"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setYoga(!yoga);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={yoga}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Yoga/Flexibility"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBalance(!balance);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={balance}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Balance/Stability"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSpeed(!speed);
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      isChecked={speed}
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text>{"Speed/Explosive"}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
        </ScrollView>
      </View>
      {workoutName.trim() === "" ? null : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <SolidButton
            onPress={async () => {
              try {
                setIsSubmitting(true);
                let workoutRef = null;
                if (workoutID) {
                  workoutRef = firebase
                    .firestore()
                    .collection("workouts")
                    .doc(workoutID);
                } else {
                  workoutRef = firebase
                    .firestore()
                    .collection("workouts")
                    .doc();
                }
                // update firebase storage

                let photoURL = null;
                if (workoutImage) {
                  const response = await fetch(workoutImage);
                  const blob = await response.blob();
                  const imageSnapshot = await firebase
                    .storage()
                    .ref()
                    .child("workoutImages")
                    .child(workoutRef.id + ".png")
                    .put(blob);
                  photoURL = await imageSnapshot.ref.getDownloadURL();
                }

                const workoutData = {
                  workoutID: workoutRef.id,
                  authorID: firebase.auth().currentUser.uid,
                  workoutName: workoutName,
                  workoutImage: photoURL,
                  public: publicWorkout,
                  isWeightNeeded: weightNeeded,
                  isBarNeeded: barNeeded,
                  isChairNeeded: chairNeeded,
                  isMatNeeded: matNeeded,
                  isTowelNeeded: towelNeeded,
                  isStrength: strength,
                  isCardio: cardio,
                  isBalance: balance,
                  isYoga: yoga,
                  isSpeed: speed,
                  time: 0,
                  favorites: 0,
                  deleted: false,
                };
                console.log(workoutData);
                workoutRef.set(workoutData, { merge: true });

                navigation.navigate("Workout Editor", {
                  workoutID: workoutData.workoutID,
                });
              } catch (error) {
                console.log("Error is", error);
              } finally {
                setIsSubmitting(false);
              }
            }}
            title="Submit"
          />
        </View>
      )}
    </View>
  );
}
