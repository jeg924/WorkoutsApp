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
} from "react-native";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Constants from "expo-constants";
import { Feather } from "@expo/vector-icons";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function WorkoutInfoForm({ navigation, route }) {
  const { workoutID } = route.params;
  var published = false;
  async function loadWorkoutData() {
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

        published = workout.published;
        Image.prefetch(workoutImage);
      }
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadWorkoutData();
  }, []);

  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [workoutName, setWorkoutName] = React.useState("");
  const [workoutImage, setWorkoutImage] = React.useState(null);

  const [isWeightNeeded, setWeightNeeded] = React.useState(false);
  const [isBarNeeded, setBarNeeded] = React.useState(false);
  const [isChairNeeded, setChairNeeded] = React.useState(false);
  const [isMatNeeded, setMatNeeded] = React.useState(false);
  const [isTowelNeeded, setTowelNeeded] = React.useState(false);

  const [isStrength, setStrength] = React.useState(false);
  const [isCardio, setCardio] = React.useState(false);
  const [isFlexibility, setFlexibility] = React.useState(false);

  const equipmentNeeded = [
    {
      value: isWeightNeeded,
      onChange: setWeightNeeded,
      description: "Weights or resistance bands",
    },
    {
      value: isBarNeeded,
      onChange: setBarNeeded,
      description: "Chin-Up Bar",
    },
    {
      value: isChairNeeded,
      onChange: setChairNeeded,
      description: "Bench or chair",
    },
    {
      value: isMatNeeded,
      onChange: setMatNeeded,
      description: "Mat",
    },
    {
      value: isTowelNeeded,
      onChange: setTowelNeeded,
      description: "Towel",
    },
  ];
  const category = [
    {
      value: isStrength,
      onChange: () => {
        setStrength(true);
        setFlexibility(false);
        setCardio(false);
      },
      description: "Strength",
    },
    {
      value: isCardio,
      onChange: () => {
        setStrength(false);
        setFlexibility(false);
        setCardio(true);
      },
      description: "Cardio",
    },
    {
      value: isFlexibility,
      onChange: () => {
        setStrength(false);
        setFlexibility(true);
        setCardio(false);
      },
      description: "Flexibility",
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
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
    <View style={{ flex: 1, marginTop: 20, backgroundColor: "white" }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }}></View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Feather name="chevron-left" size={30} />
        </View>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 16, justifyContent: "center" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", margin: 10 }}>
            Create a workout
          </Text>
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }}></View>
        {workoutImage ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              source={{ uri: workoutImage, cache: "force-cache" }}
              style={{ width: 50, height: 50 }}
            />
          </View>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              source={require("../assets/placeholder-image.png")}
              style={{ width: 50, height: 50 }}
            />
          </View>
        )}
        <View style={{ flex: 1 }}></View>
        <View
          style={{ flex: 7, justifyContent: "center", alignItems: "center" }}
        >
          <SecondaryButton
            onPress={async () => {
              if (Constants.platform.ios) {
                let { status } = await ImagePicker.getCameraPermissionsAsync();
                if (status !== "granted") {
                  status = await ImagePicker.requestCameraPermissionsAsync();
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
      <View style={{ flex: 7 }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 13 }}>
            <Text style={{ fontWeight: "bold" }}>Workout Name</Text>
            <TextInput
              style={{
                borderRadius: 10,
                borderWidth: 1,
                padding: 10,
                width: "100%",
              }}
              onChangeText={(x) => {
                setWorkoutName(x);
              }}
              defaultValue={workoutName}
            ></TextInput>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <View style={{ flex: 5 }}>
          <View style={{ flexDirection: "row", flex: 6 }}>
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 12 }}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold" }}>Equipment Needed</Text>
              </View>
              {equipmentNeeded.map((item) => {
                return (
                  <View
                    style={{
                      flex: 0.8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      onPress={item.onChange}
                    />
                    <Text>{item.description}</Text>
                  </View>
                );
              })}
            </View>
            <View style={{ flex: 1 }}></View>
          </View>

          <View style={{ flexDirection: "row", flex: 4 }}>
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 12 }}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold" }}>Category</Text>
              </View>
              {category.map((item) => {
                return (
                  <View
                    style={{
                      flex: 0.8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <BouncyCheckbox
                      size={25}
                      fillColor="blue"
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: "blue" }}
                      textStyle={{}}
                      onPress={item.onChange}
                    />
                    <Text>{item.description}</Text>
                  </View>
                );
              })}
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <SolidButton
          onPress={async () => {
            try {
              setIsSubmitting(true);
              let workoutRef = null;
              let published = false;
              if (workoutID) {
                workoutRef = firebase
                  .firestore()
                  .collection("workouts")
                  .doc(workoutID);
              } else {
                workoutRef = firebase.firestore().collection("workouts").doc();
              }
              // update firebase storage
              const response = await fetch(workoutImage);
              const blob = await response.blob();
              const imageSnapshot = await firebase
                .storage()
                .ref()
                .child("workoutImages")
                .child(workoutRef.id + ".png")
                .put(blob);

              const photoURL = await imageSnapshot.ref.getDownloadURL();

              const workoutData = {
                workoutID: workoutRef.id,
                authorID: firebase.auth().currentUser.uid,
                published: published,
                workoutName: workoutName,
                workoutImage: photoURL,
                isWeightNeeded: isWeightNeeded,
                isBarNeeded: isBarNeeded,
                isChairNeeded: isChairNeeded,
                isMatNeeded: isMatNeeded,
                isTowelNeeded: isTowelNeeded,
                isStrength: isStrength,
                isCardio: isCardio,
                isFlexibility: isFlexibility,
                lengthInMinutes: 0,
                deleted: false,
              };
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
          title="Edit Exercises"
        />
      </View>
    </View>
  );
}
