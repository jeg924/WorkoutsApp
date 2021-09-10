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
import Header from "../components/Header";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function WorkoutInfoForm({ navigation, route }) {
  const { workoutID } = route.params;

  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [workoutName, setWorkoutName] = React.useState("");
  const [workoutImage, setWorkoutImage] = React.useState(null);

  const [publicWorkout, setPublicWorkout] = React.useState(false);

  const [isWeightNeeded, setWeightNeeded] = React.useState(false);
  const [isBarNeeded, setBarNeeded] = React.useState(false);
  const [isChairNeeded, setChairNeeded] = React.useState(false);
  const [isMatNeeded, setMatNeeded] = React.useState(false);
  const [isTowelNeeded, setTowelNeeded] = React.useState(false);

  const [isStrength, setStrength] = React.useState(false);
  const [isCardio, setCardio] = React.useState(false);
  const [isBalance, setBalance] = React.useState(false);
  const [isYoga, setYoga] = React.useState(false);
  const [isSpeed, setSpeed] = React.useState(false);

  const [equipmentNeeded, setEquipmentNeeded] = React.useState(null);
  const [category, setCategory] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadWorkoutData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadWorkoutData() {
    try {
      setLoading(true);
      var equipmentNeeded;
      var category;
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

          equipmentNeeded = [
            {
              value: workout.isWeightNeeded,
              onChange: setWeightNeeded,
              description: "Weights or resistance bands",
            },
            {
              value: workout.isBarNeeded,
              onChange: setBarNeeded,
              description: "Chin-Up Bar",
            },
            {
              value: workout.isChairNeeded,
              onChange: setChairNeeded,
              description: "Bench or chair",
            },
            {
              value: workout.isMatNeeded,
              onChange: setMatNeeded,
              description: "Mat",
            },
            {
              value: workout.isTowelNeeded,
              onChange: setTowelNeeded,
              description: "Towel",
            },
          ];
          category = [
            {
              value: workout.isStrength,
              onChange: setStrength,
              description: "Strength",
            },
            {
              value: workout.isCardio,
              onChange: setCardio,
              description: "Cardio",
            },
            {
              value: workout.isBalance,
              onChange: setBalance,
              description: "Balance",
            },
            {
              value: workout.isSpeed,
              onChange: setSpeed,
              description: "Speed",
            },
            {
              value: workout.isYoga,
              onChange: setYoga,
              description: "Yoga",
            },
          ];
        }
      } else {
        equipmentNeeded = [
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
        category = [
          {
            value: isStrength,
            onChange: () => {
              setStrength(!isStrength);
            },
            description: "Strength",
          },
          {
            value: isCardio,
            onChange: setCardio,
            description: "Cardio",
          },
          {
            value: isBalance,
            onChange: setBalance,
            description: "Balance",
          },
          {
            value: isSpeed,
            onChange: setSpeed,
            description: "Speed",
          },
          {
            value: isYoga,
            onChange: setYoga,
            description: "Yoga",
          },
        ];
      }
      setEquipmentNeeded(equipmentNeeded);
      setCategory(category);
    } catch (error) {
      console.log("error is ###" + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading blablabla</Text>
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
          <ScrollView style={{}}>
            <View style={{}}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}></View>
                <View style={{ flex: 1 }}>
                  <TouchableHighlight
                    onPress={() => {
                      setPublicWorkout(false);
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        color: !publicWorkout ? "blue" : "black",
                        textDecorationLine: !publicWorkout
                          ? "underline"
                          : "none",
                      }}
                    >
                      Private
                    </Text>
                  </TouchableHighlight>
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
                <View style={{ flex: 1 }}>
                  <TouchableHighlight
                    onPress={() => {
                      setPublicWorkout(true);
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        color: publicWorkout ? "blue" : "black",
                        textDecorationLine: publicWorkout
                          ? "underline"
                          : "none",
                      }}
                    >
                      Public
                    </Text>
                  </TouchableHighlight>
                </View>
                <View style={{ flex: 1 }}></View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}></View>
                <View style={{ flex: 12 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "2%",
                      marginTop: "2%",
                    }}
                  >
                    Equipment Needed
                  </Text>
                  {equipmentNeeded.map((item) => {
                    return (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          margin: "1%",
                        }}
                      >
                        <BouncyCheckbox
                          isChecked={item.value}
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
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: "2%",
                      marginTop: "2%",
                    }}
                  >
                    Category
                  </Text>
                  {category.map((item) => {
                    return (
                      <View
                        style={{
                          flex: 0.8,
                          flexDirection: "row",
                          alignItems: "center",
                          margin: "1%",
                        }}
                      >
                        <BouncyCheckbox
                          isChecked={item.value}
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
          </ScrollView>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
                workoutRef = firebase.firestore().collection("workouts").doc();
              }
              // update firebase storage

              if (workoutImage) {
                const response = await fetch(workoutImage);
                const blob = await response.blob();
                const imageSnapshot = await firebase
                  .storage()
                  .ref()
                  .child("workoutImages")
                  .child(workoutRef.id + ".png")
                  .put(blob);
              }

              const photoURL = workoutImage
                ? await imageSnapshot.ref.getDownloadURL()
                : null;

              const workoutData = {
                workoutID: workoutRef.id,
                authorID: firebase.auth().currentUser.uid,
                workoutName: workoutName,
                workoutImage: photoURL,
                public: publicWorkout,
                isWeightNeeded: isWeightNeeded,
                isBarNeeded: isBarNeeded,
                isChairNeeded: isChairNeeded,
                isMatNeeded: isMatNeeded,
                isTowelNeeded: isTowelNeeded,
                isStrength: isStrength,
                isCardio: isCardio,
                isBalance: isBalance,
                isYoga: isYoga,
                isSpeed: isSpeed,
                time: 0,
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
          title="Add Exercises"
        />
      </View>
    </View>
  );
}
