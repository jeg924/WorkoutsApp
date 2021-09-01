import React from "react";
import firebase from "firebase";
import { View, Text, Modal, Image, TouchableHighlight } from "react-native";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import { Picker } from "@react-native-picker/picker";

function calculateWinningStatsForThisWorkout() {
  let averageWinnerObject = {};
  averageWinnerObject.exerciseWinners = [];
  averageWinnerObject.winner = "";
  let winCode = 0;
  let myAverageWins = 0;
  let friendAverageWins = 0;
  for (let i = 0; i < exercises.length; i++) {
    winCode = calculateWinningStatsForThisExercise(
      workout.primaryType,
      averageStats.exerciseInputData[i],
      friend.averageStats[i]
    );
    if (winCode === 0) {
      averageWinnerObject.exerciseWinners.push("tie");
    } else if (winCode === 1) {
      averageWinnerObject.exerciseWinners.push(firebase.auth().currentUser.uid);
      myAverageWins++;
    } else {
      averageWinnerObject.exerciseWinners.push(friend.userID);
      friendAverageWins++;
    }
  }
  averageWinnerObject.winner =
    friendAverageWins < myAverageWins
      ? friend.userID
      : friendAverageWins > myAverageWins
      ? firebase.auth().currentUser.uid
      : "tie";
}

function calculateWinningStatsForThisExercise(
  typeOfWorkout,
  myAverageStatsForThisExercise,
  friendsAverageStatsForThisExercise
) {
  let friendsScoreForThisExercise = 0;
  let myScoreForThisExercise = 0;
  if (
    friendsAverageStatsForThisExercise.reps != NaN &&
    friendsAverageStatsForThisExercise.weight == NaN &&
    friendsAverageStatsForThisExercise.time == NaN
  ) {
    return friendsAverageStatsForThisExercise.reps >
      myAverageStatsForThisExercise.reps
      ? 2
      : friendsAverageStatsForThisExercise.reps <
        myAverageStatsForThisExercise.reps
      ? 1
      : 0;
  } else if (
    friendsAverageStatsForThisExercise.reps == NaN &&
    friendsAverageStatsForThisExercise.weight != NaN &&
    friendsAverageStatsForThisExercise.time == NaN
  ) {
    return friendsAverageStatsForThisExercise.weight >
      myAverageStatsForThisExercise.weight
      ? 2
      : friendsAverageStatsForThisExercise.weight <
        myAverageStatsForThisExercise.weight
      ? 1
      : 0;
  } else if (
    friendsAverageStatsForThisExercise.reps == NaN &&
    friendsAverageStatsForThisExercise.weight == NaN &&
    friendsAverageStatsForThisExercise.time != NaN
  ) {
    return friendsAverageStatsForThisExercise.time >
      myAverageStatsForThisExercise.time
      ? 2
      : friendsAverageStatsForThisExercise.time <
        myAverageStatsForThisExercise.time
      ? 1
      : 0;
  } else if (
    friendsAverageStatsForThisExercise.reps != NaN &&
    friendsAverageStatsForThisExercise.weight != NaN &&
    friendsAverageStatsForThisExercise.time == NaN
  ) {
    if (typeOfWorkout === "strength") {
      //todo: if workout is a strength workout, then... weight matters most
      // only multiply by first 10 reps. additional 10 reps get multiplied by 1/2. additional 10 by 1/4. then
      // weight && reps:
      // if (reps >= 30): weight * 17.5, if reps between 20 and 30: weight:  weight * (15 + .25 * reps % 20)...
      // weight * first 10 secs...
      // if time & reps. Time is treated like weight. more is better. Time * reps
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps >= 30
          ? friendsAverageStatsForThisExercise.weight * 17.5
          : friendsAverageStatsForThisExercise.reps >= 20 &&
            friendsAverageStatsForThisExercise.reps < 30
          ? friendsAverageStatsForThisExercise.weight *
            (15 + 0.25 * (friendsAverageStatsForThisExercise.reps - 20))
          : friendsAverageStatsForThisExercise.reps >= 10 &&
            friendsAverageStatsForThisExercise.reps < 20
          ? friendsAverageStatsForThisExercise.weight *
            (10 + 0.5 * (friendsAverageStatsForThisExercise.reps - 10))
          : friendsAverageStatsForThisExercise.weight *
            friendsAverageStatsForThisExercise.reps;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps >= 30
          ? myAverageStatsForThisExercise.weight * 17.5
          : myAverageStatsForThisExercise.reps >= 20 &&
            myAverageStatsForThisExercise.reps < 30
          ? myAverageStatsForThisExercise.weight *
            (15 + 0.25 * (myAverageStatsForThisExercise.reps - 20))
          : myAverageStatsForThisExercise.reps >= 10 &&
            myAverageStatsForThisExercise.reps < 20
          ? myAverageStatsForThisExercise.weight *
            (10 + 0.5 * (myAverageStatsForThisExercise.reps - 10))
          : myAverageStatsForThisExercise.weight *
            myAverageStatsForThisExercise.reps;
    } else if (typeOfWorkout === "cardio") {
      //todo: if workout is a cardio. then.. reps matters most
      // first 10 lbs * reps..
      // if weight & time. Treat time in seconds like reps. first 10 lbs * time
      // if time and reps. Treat time as a divider.
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.weight >= 30
          ? friendsAverageStatsForThisExercise.reps * 17.5
          : friendsAverageStatsForThisExercise.weight >= 20 &&
            friendsAverageStatsForThisExercise.weight < 30
          ? friendsAverageStatsForThisExercise.reps *
            (15 + 0.25 * (friendsAverageStatsForThisExercise.weight - 20))
          : friendsAverageStatsForThisExercise.weight >= 10 &&
            friendsAverageStatsForThisExercise.weight < 20
          ? friendsAverageStatsForThisExercise.reps *
            (10 + 0.5 * (friendsAverageStatsForThisExercise.weight - 10))
          : friendsAverageStatsForThisExercise.reps *
            friendsAverageStatsForThisExercise.weight;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.weight >= 30
          ? myAverageStatsForThisExercise.reps * 17.5
          : myAverageStatsForThisExercise.weight >= 20 &&
            myAverageStatsForThisExercise.weight < 30
          ? myAverageStatsForThisExercise.reps *
            (15 + 0.25 * (myAverageStatsForThisExercise.weight - 20))
          : myAverageStatsForThisExercise.weight >= 10 &&
            myAverageStatsForThisExercise.weight < 20
          ? myAverageStatsForThisExercise.reps *
            (10 + 0.5 * (myAverageStatsForThisExercise.weight - 10))
          : myAverageStatsForThisExercise.reps *
            myAverageStatsForThisExercise.weight;
    } else if (typeOfWorkout === "flexibility") {
      // time && reps: time + reps
      // time && weight: time + weight
      // weight && reps: reps + weight
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps +
        friendsAverageStatsForThisExercise.weight;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps +
        myAverageStatsForThisExercise.weight;
    }
    return friendsScoreForThisExercise > myScoreForThisExercise
      ? 2
      : friendsScoreForThisExercise < myScoreForThisExercise
      ? 1
      : 0;
  } else if (
    myAverageStatsForThisExercise.reps != NaN &&
    friendsAverageStatsForThisExercise.weight == NaN &&
    friendsAverageStatsForThisExercise.time != NaN
  ) {
    if (typeOfWorkout === "strength") {
      //todo: if workout is a strength workout, then... weight matters most
      // only multiply by first 10 reps. additional 10 reps get multiplied by 1/2. additional 10 by 1/4. then
      // weight && reps:
      // if (reps >= 30): weight * 17.5, if reps between 20 and 30: weight:  weight * (15 + .25 * reps % 20)...
      // weight * first 10 secs...
      // if time & reps. Time is treated like weight. more is better. Time * reps
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps *
        friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps * myAverageStatsForThisExercise.time;
    } else if (typeOfWorkout === "cardio") {
      //todo: if workout is a cardio. then.. reps matters most
      // first 10 lbs * reps..
      // if weight & time. Treat time in seconds like reps. first 10 lbs * time
      // if time and reps. Treat time as a divider.
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps -
        friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps - myAverageStatsForThisExercise.time;
    } else if (typeOfWorkout === "flexibility") {
      // time && reps: time + reps
      // time && weight: time + weight
      // weight && reps: reps + weight
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps +
        friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps + myAverageStatsForThisExercise.time;
    }
    return friendsScoreForThisExercise > myScoreForThisExercise
      ? 2
      : friendsScoreForThisExercise < myScoreForThisExercise
      ? 1
      : 0;
  } else if (
    friendsAverageStatsForThisExercise.reps == NaN &&
    friendsAverageStatsForThisExercise.weight != NaN &&
    friendsAverageStatsForThisExercise.time != NaN
  ) {
    if (typeOfWorkout === "strength") {
      //todo: if workout is a strength workout, then... weight matters most
      // only multiply by first 10 reps. additional 10 reps get multiplied by 1/2. additional 10 by 1/4. then
      // weight && reps:
      // if (reps >= 30): weight * 17.5, if reps between 20 and 30: weight:  weight * (15 + .25 * reps % 20)...
      // weight * first 10 secs...
      // if time & reps. Time is treated like weight. more is better. Time * reps
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.time >= 30
          ? friendsAverageStatsForThisExercise.weight * 17.5
          : friendsAverageStatsForThisExercise.time >= 20 &&
            friendsAverageStatsForThisExercise.time < 30
          ? friendsAverageStatsForThisExercise.weight *
            (15 + 0.25 * (friendsAverageStatsForThisExercise.time - 20))
          : friendsAverageStatsForThisExercise.time >= 10 &&
            friendsAverageStatsForThisExercise.time < 20
          ? friendsAverageStatsForThisExercise.weight *
            (10 + 0.5 * (friendsAverageStatsForThisExercise.time - 10))
          : friendsAverageStatsForThisExercise.weight *
            friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.time >= 30
          ? myAverageStatsForThisExercise.weight * 17.5
          : myAverageStatsForThisExercise.time >= 20 &&
            myAverageStatsForThisExercise.time < 30
          ? myAverageStatsForThisExercise.weight *
            (15 + 0.25 * (myAverageStatsForThisExercise.time - 20))
          : myAverageStatsForThisExercise.time >= 10 &&
            myAverageStatsForThisExercise.time < 20
          ? myAverageStatsForThisExercise.weight *
            (10 + 0.5 * (myAverageStatsForThisExercise.time - 10))
          : myAverageStatsForThisExercise.weight *
            myAverageStatsForThisExercise.time;
    } else if (typeOfWorkout === "cardio") {
      //todo: if workout is a cardio. then.. reps matters most
      // first 10 lbs * reps..
      // if weight & time. Treat time in seconds like reps. first 10 lbs * time
      // if time and reps. Treat time as a divider.
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.weight >= 30
          ? friendsAverageStatsForThisExercise.time * 17.5
          : friendsAverageStatsForThisExercise.weight >= 20 &&
            friendsAverageStatsForThisExercise.weight < 30
          ? friendsAverageStatsForThisExercise.time *
            (15 + 0.25 * (friendsAverageStatsForThisExercise.weight - 20))
          : friendsAverageStatsForThisExercise.weight >= 10 &&
            friendsAverageStatsForThisExercise.weight < 20
          ? friendsAverageStatsForThisExercise.time *
            (10 + 0.5 * (friendsAverageStatsForThisExercise.weight - 10))
          : friendsAverageStatsForThisExercise.time *
            friendsAverageStatsForThisExercise.weight;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.weight >= 30
          ? myAverageStatsForThisExercise.time * 17.5
          : myAverageStatsForThisExercise.weight >= 20 &&
            myAverageStatsForThisExercise.weight < 30
          ? myAverageStatsForThisExercise.time *
            (15 + 0.25 * (myAverageStatsForThisExercise.weight - 20))
          : myAverageStatsForThisExercise.weight >= 10 &&
            myAverageStatsForThisExercise.weight < 20
          ? myAverageStatsForThisExercise.time *
            (10 + 0.5 * (myAverageStatsForThisExercise.weight - 10))
          : myAverageStatsForThisExercise.time *
            myAverageStatsForThisExercise.weight;
    } else if (typeOfWorkout === "flexibility") {
      // time && reps: time + reps
      // time && weight: time + weight
      // weight && reps: reps + weight
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.weight +
        friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.weight +
        myAverageStatsForThisExercise.time;
    }
    return friendsScoreForThisExercise > myScoreForThisExercise
      ? 2
      : friendsScoreForThisExercise < myScoreForThisExercise
      ? 1
      : 0;
  } else {
    // all three
    if (typeOfWorkout === "strength") {
      //todo: if workout is a strength workout, then... weight matters most
      // only multiply by first 10 reps. additional 10 reps get multiplied by 1/2. additional 10 by 1/4. then
      // weight && reps:
      // if (reps >= 30): weight * 17.5, if reps between 20 and 30: weight:  weight * (15 + .25 * reps % 20)...
      // weight * first 10 secs...
      // if time & reps. Time is treated like weight. more is better. Time * reps
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps >= 30
          ? friendsAverageStatsForThisExercise.weight * 17.5 -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.reps >= 20 &&
            friendsAverageStatsForThisExercise.reps < 30
          ? friendsAverageStatsForThisExercise.weight *
              (15 + 0.25 * (friendsAverageStatsForThisExercise.reps - 20)) -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.reps >= 10 &&
            friendsAverageStatsForThisExercise.reps < 20
          ? friendsAverageStatsForThisExercise.weight *
              (10 + 0.5 * (friendsAverageStatsForThisExercise.reps - 10)) -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.weight *
              friendsAverageStatsForThisExercise.reps -
            friendsAverageStatsForThisExercise.time / 10;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps >= 30
          ? myAverageStatsForThisExercise.weight * 17.5 -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.reps >= 20 &&
            myAverageStatsForThisExercise.reps < 30
          ? myAverageStatsForThisExercise.weight *
              (15 + 0.25 * (myAverageStatsForThisExercise.reps - 20)) -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.reps >= 10 &&
            myAverageStatsForThisExercise.reps < 20
          ? myAverageStatsForThisExercise.weight *
              (10 + 0.5 * (myAverageStatsForThisExercise.reps - 10)) -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.weight *
              myAverageStatsForThisExercise.reps -
            myAverageStatsForThisExercise.time / 10;
    } else if (typeOfWorkout === "cardio") {
      //todo: if workout is a cardio. then.. reps matters most
      // first 10 lbs * reps..
      // if weight & time. Treat time in seconds like reps. first 10 lbs * time
      // if time and reps. Treat time as a divider.
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.weight >= 30
          ? friendsAverageStatsForThisExercise.reps * 17.5 -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.weight >= 20 &&
            friendsAverageStatsForThisExercise.weight < 30
          ? friendsAverageStatsForThisExercise.reps *
              (15 + 0.25 * (friendsAverageStatsForThisExercise.weight - 20)) -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.weight >= 10 &&
            friendsAverageStatsForThisExercise.weight < 20
          ? friendsAverageStatsForThisExercise.reps *
              (10 + 0.5 * (friendsAverageStatsForThisExercise.weight - 10)) -
            friendsAverageStatsForThisExercise.time / 10
          : friendsAverageStatsForThisExercise.reps *
              friendsAverageStatsForThisExercise.weight -
            friendsAverageStatsForThisExercise.time / 10;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.weight >= 30
          ? myAverageStatsForThisExercise.reps * 17.5 -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.weight >= 20 &&
            myAverageStatsForThisExercise.weight < 30
          ? myAverageStatsForThisExercise.reps *
              (15 + 0.25 * (myAverageStatsForThisExercise.weight - 20)) -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.weight >= 10 &&
            myAverageStatsForThisExercise.weight < 20
          ? myAverageStatsForThisExercise.reps *
              (10 + 0.5 * (myAverageStatsForThisExercise.weight - 10)) -
            myAverageStatsForThisExercise.time / 10
          : myAverageStatsForThisExercise.reps *
              myAverageStatsForThisExercise.weight -
            myAverageStatsForThisExercise.time / 10;
    } else if (typeOfWorkout === "flexibility") {
      // time && reps: time + reps
      // time && weight: time + weight
      // weight && reps: reps + weight
      friendsScoreForThisExercise =
        friendsAverageStatsForThisExercise.reps +
        friendsAverageStatsForThisExercise.weight +
        friendsAverageStatsForThisExercise.time;

      myScoreForThisExercise =
        myAverageStatsForThisExercise.reps +
        myAverageStatsForThisExercise.weight +
        friendsAverageStatsForThisExercise.time;
    }
    return friendsScoreForThisExercise > myScoreForThisExercise
      ? 2
      : friendsScoreForThisExercise < myScoreForThisExercise
      ? 1
      : 0;
  }
}

export default function WorkoutReview({ navigation, route }) {
  const { workout, exercises } = route.params;

  const [timesCompleted, setTimesCompleted] = React.useState(null);
  const [averageCategory, setAverageCategory] = React.useState(false);
  const [bestCategory, setBestCategory] = React.useState(true);
  const [latestCategory, setLatestCategory] = React.useState(false);
  const [myProfilePicture, setMyProfilePicture] = React.useState(null);
  const [myDisplayName, setMyDisplayName] = React.useState(null);
  const [latestStats, setLatestStats] = React.useState(null);
  const [averageStats, setAverageStats] = React.useState(null);
  const [bestStats, setBestStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [friends, setFriends] = React.useState(null);
  const [friendsLatestStats, setFriendsLatestStats] = React.useState(null);
  const [friendsBestStats, setFriendsBestStats] = React.useState(null);
  const [friendsAverageStats, setFriendsAverageStats] = React.useState(null);
  const [friend, setFriend] = React.useState(null);
  const [averageWinner, setAverageWinner] = React.useState(null);
  const [bestWinner, setBestWinner] = React.useState(null);
  const [latestWinner, setLatestWinner] = React.useState(null);

  const updateFriend = (friend) => {
    if (friend.hasStatsForThisWorkout) {
      setFriend(friend);
      calculateWinningStatsForThisWorkout();
    } else {
      alert("This friend does not have any stats for this workout yet.");
    }
    // lets pick a winner based on total exercies.
    // should be a grid.
    // average. best. latest.
    // 1. winner: friend, winner: me, winner: friend...
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    try {
      setLoading(true);

      const workoutID = workout.workoutID;
      const myID = firebase.auth().currentUser.uid;

      const recordedWorkoutRef = firebase
        .firestore()
        .collection("users")
        .doc(myID)
        .collection("recorded workouts")
        .where("workoutID", "==", workoutID);
      const recordedWorkoutDocs = await recordedWorkoutRef.get();
      var allMyStats = [];
      recordedWorkoutDocs.forEach((doc) => {
        allMyStats.push(doc.data());
      });
      allMyStats = allMyStats.filter((record) => record.timeCompleted);

      // console.log("all my stats");
      // console.log(allMyStats);
      // console.log(allMyStats.length);
      setTimesCompleted(allMyStats.length);

      const latestDoc = await recordedWorkoutRef
        .orderBy("timeStarted", "desc")
        .limit(1)
        .get();

      var latest = {};
      // console.log("all the records in latest doc");
      latestDoc.forEach((doc) => {
        // console.log(doc.data());
        latest = doc.data();
      });
      // console.log("latest");
      // console.log(latest);
      setLatestStats(latest.exerciseInputData);

      // Could be partially empty.
      let best = JSON.parse(JSON.stringify(latest.exerciseInputData));
      let totalReps = [];
      let totalWeight = [];
      let totalTime = [];
      let totalRecords = allMyStats.length;
      let maxExercisesPerRecord = exercises.length;
      let totalRecordsPerExerciseThatTrackReps = [];
      let totalRecordsPerExerciseThatTrackWeight = [];
      let totalRecordsPerExerciseThatTrackTime = [];

      for (var i = 0; i < totalRecords; ++i) {
        for (var j = 0; j < maxExercisesPerRecord; ++j) {
          if (allMyStats[i].exerciseInputData[j] == undefined) {
            // the user started a workout but didn't finish.
            continue;
          }
          let reps = allMyStats[i].exerciseInputData[j].reps;
          let weight = allMyStats[i].exerciseInputData[j].weight;
          let time = allMyStats[i].exerciseInputData[j].time;

          // assuming for now the only way they can get to the workout review,
          // is that their latest (and best) has complete exercise input data.
          // even if that data is null.
          if (reps > best[j].reps) {
            best[j].reps = reps;
          }
          if (weight > best[j].weight) {
            best[j].weight = weight;
          }
          if (time > best[j].time) {
            best[j].time = time;
          }

          // only input is counted. if the user skipped exercises
          // or completed them but didn't fill out all the input data
          // they're just not counted in the calculation for average.
          if (i == 0) {
            if (reps) {
              totalReps[j] = reps;
              totalRecordsPerExerciseThatTrackReps[j] = 1;
            }
            if (weight) {
              totalWeight[j] = weight;
              totalRecordsPerExerciseThatTrackWeight[j] = 1;
            }
            if (time) {
              totalTime[j] = time;
              totalRecordsPerExerciseThatTrackTime[j] = 1;
            }
          } else {
            if (reps) {
              totalReps[j] += reps;
              totalRecordsPerExerciseThatTrackReps[j] += 1;
            }
            if (weight) {
              totalWeight[j] += weight;
              totalRecordsPerExerciseThatTrackWeight[j] += 1;
            }
            if (time) {
              totalTime[j] += time;
              totalRecordsPerExerciseThatTrackTime[j] += 1;
            }
          }
        }
      }

      // console.log("best");
      // console.log(best);

      setBestStats(best);

      const myRef = firebase.firestore().collection("users").doc(myID);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      var bestStatsForThisWorkoutObject = {};
      bestStatsForThisWorkoutObject.workoutID = workoutID;
      bestStatsForThisWorkoutObject.exerciseInputData = best;

      var bestStats = my.bestStats ? [...my.bestStats] : [];
      if (
        !bestStats.some(
          (statsForAWorkout) => statsForAWorkout.workoutID === workoutID
        )
      ) {
        bestStats.push(bestStatsForThisWorkoutObject);
      }

      myRef.set({ bestStats: bestStats }, { merge: true });

      let average = [];

      for (var k = 0; k < maxExercisesPerRecord; ++k) {
        var exerciseAverageStats = {};
        exerciseAverageStats.name = allMyStats[0].exerciseInputData[k].name;
        exerciseAverageStats.reps = Math.round(
          totalReps[k] / totalRecordsPerExerciseThatTrackReps[k]
        );
        exerciseAverageStats.weight = Math.round(
          totalWeight[k] / totalRecordsPerExerciseThatTrackWeight[k]
        );
        exerciseAverageStats.time = Math.round(
          totalTime[k] / totalRecordsPerExerciseThatTrackTime[k]
        );
        average[k] = exerciseAverageStats;
      }

      // console.log("average");
      // console.log(average);
      setAverageStats(average);

      var averageStatsForThisWorkoutObject = {};
      averageStatsForThisWorkoutObject.workoutID = workoutID;
      averageStatsForThisWorkoutObject.exerciseInputData = average;

      var averageStats = my.averageStats ? [...my.averageStats] : [];
      if (
        !averageStats.some(
          (statsForAWorkout) => statsForAWorkout.workoutID === workoutID
        )
      ) {
        averageStats.push(averageStatsForThisWorkoutObject);
      }

      myRef.set({ averageStats: averageStats }, { merge: true });

      if (my.photoURL) {
        await Image.prefetch(my.photoURL);
        setMyProfilePicture(my.photoURL);
      }
      setMyDisplayName(my.displayName);

      if (!my.friends) {
        setLoading(false);
        return;
      }

      const friends = [...my.friends];
      setFriends(friends);

      const friendsLatestWorkouts = [];
      const friendLatestStatsQueries = [];
      const friendsAverageStats = [];
      const friendsBestStats = [];
      const friendAverageAndBestStatsQueries = [];

      for (let i = 0; i < friends.length; ++i) {
        let friend = friends[i].userID;
        var friendRef = firebase.firestore().collection("users").doc(friend);

        var friendsLatestStatRef = friendRef
          .collection("recorded workouts")
          .where("workoutID", "==", workoutID)
          .orderBy("timeStarted", "desc")
          .limit(1);

        var friendLatestStatPromise = friendsLatestStatRef
          .get()
          .then((friendsLatestStatDocs) => {
            if (friendsLatestStatDocs.size) {
              var doc = friendsLatestStatDocs.docs[0];
              var friendLatestStatData = doc.data();
              friendLatestStatData.userID = friend;

              friendsLatestWorkouts.push(friendLatestStatData);
            }
          });

        friendLatestStatsQueries.push(friendLatestStatPromise);

        var friendBestAndAverageStatsPromise = friendRef
          .get()
          .then((friendDoc) => {
            var friendData = friendDoc.data();
            if (friendData) {
              if (friendData.averageStats) {
                let averageStats = [];
                for (let i = 0; i < friendData.averageStats.length; ++i) {
                  if (friendData.averageStats[i].workoutID === workoutID) {
                    let averageStatsOfAParticularUserForThisParticularWorkout =
                      {};
                    averageStatsOfAParticularUserForThisParticularWorkout.userID =
                      friend;
                    averageStatsOfAParticularUserForThisParticularWorkout.workoutID =
                      workoutID;
                    averageStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                      friendData.averageStats[i].exerciseInputData;

                    friendsAverageStats.push(
                      averageStatsOfAParticularUserForThisParticularWorkout
                    );
                  }
                }
              }
              if (friendData.bestStats) {
                for (let i = 0; i < friendData.averageStats.length; ++i) {
                  if (friendData.bestStats[i].workoutID === workoutID) {
                    let bestStatsOfAParticularUserForThisParticularWorkout = {};

                    bestStatsOfAParticularUserForThisParticularWorkout.userID =
                      friend;
                    bestStatsOfAParticularUserForThisParticularWorkout.workoutID =
                      workoutID;
                    bestStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                      friendData.bestStats[i].exerciseInputData;

                    friendsBestStats.push(
                      bestStatsOfAParticularUserForThisParticularWorkout
                    );
                  }
                }
              }
            }
          });
        friendAverageAndBestStatsQueries.push(friendBestAndAverageStatsPromise);
      }
      Promise.all(friendLatestStatsQueries).then(() => {
        setFriendsLatestStats(friendsLatestWorkouts);
      });
      Promise.all(friendAverageAndBestStatsQueries).then(() => {
        setFriendsAverageStats(friendsAverageStats);
        setFriendsBestStats(friendsBestStats);
      });
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }

  // console.log("friendToCompareWith");
  // console.log(friendToCompareWith);

  // console.log("my friends");
  // console.log(friends);

  // console.log("friend latest stats");
  // console.log(friendsLatestStats);
  // console.log("friend average stats");
  // console.log(friendsAverageStats);
  // console.log("friend best stats");
  // console.log(friendsBestStats);

  // console.log("friend");
  // console.log(friend);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: "center",
          marginTop: "6%",
          position: "fixed",
          height: "auto",
          padding: 10,
          borderBottomColor: "black",
          borderBottomWidth: 1,
          width: "100%",
        }}
      >
        <Text style={{ fontSize: 25, fontWeight: "bold", marginLeft: "4.8%" }}>
          Review {workout.workoutName}
        </Text>
        <Text style={{ marginLeft: "4.8%" }}>
          You have completed this workout {timesCompleted} times
        </Text>
      </View>

      <View
        style={{
          width: "100%",
          height: "10%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <TouchableHighlight
          onPress={() => {
            setAverageCategory(true);
            setBestCategory(false);
            setLatestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: averageCategory ? "blue" : "black",
            }}
          >
            Average
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            setBestCategory(true);
            setAverageCategory(false);
            setLatestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: bestCategory ? "blue" : "black",
            }}
          >
            Best
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            setLatestCategory(true);
            setAverageCategory(false);
            setBestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: latestCategory ? "blue" : "black",
              fontSize: 20,
            }}
          >
            Latest
          </Text>
        </TouchableHighlight>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {friend ? (
          <View
            style={{ flex: 1, flexDirection: "row", backgroundColor: "red" }}
          >
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flexDirection: "row",
                flex: 2,
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <View>
                <Text>{"Winner"}</Text>
                <Image
                  source={{
                    uri: myProfilePicture,
                    cache: "force-cache",
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                  }}
                />
                <Text
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  {myDisplayName}
                </Text>
              </View>
              <View>
                <Text> </Text>
                <Image
                  source={{
                    uri: friend.profilePicture,
                    cache: "reload",
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                  }}
                />
                <Text
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  {friend.displayName}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 2 }}>
            <FlatList
              style={{}}
              data={
                averageCategory
                  ? averageStats
                  : bestCategory
                  ? bestStats
                  : latestStats
              }
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignContent: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}. {item.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      paddingBottom: 10,
                      paddingTop: 10,
                      paddingLeft: 20,
                    }}
                  >
                    <Text style={{}}>
                      {item.reps && !item.weight && !item.time
                        ? "Reps: " + item.reps
                        : null}
                      {item.weight && !item.weight && !item.time
                        ? "Weight: " + item.weight
                        : null}
                      {item.time && !item.reps && !item.weight
                        ? item.time % 60 >= 10
                          ? "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.reps && item.weight && !item.time
                        ? "Reps: " + item.reps + "\n" + "Weight: " + item.weight
                        : null}
                      {item.reps && item.time && !item.weight
                        ? item.time % 60 >= 10
                          ? "Reps: " +
                            item.reps +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Reps: " +
                            item.reps +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.weight && item.time && !item.reps
                        ? item.time % 60 >= 10
                          ? "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.weight && item.time && item.reps
                        ? item.time % 60 >= 10
                          ? "Reps: " +
                            item.reps +
                            "\n" +
                            "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Reps: " +
                            item.reps +
                            "\n" +
                            "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
          {friend ? (
            <View
              style={{
                flex: 1,
              }}
            >
              <FlatList
                style={{}}
                data={
                  averageCategory
                    ? friend.averageStats
                    : bestCategory
                    ? friend.bestStats
                    : friend.latestStats
                }
                renderItem={({ item }) => (
                  <View
                    style={{
                      flex: 1,
                      paddingBottom: 10,
                      paddingTop: 10,
                      paddingLeft: 20,
                    }}
                  >
                    <Text style={{ textAlign: "left" }}>
                      {item.reps && !item.weight && !item.time
                        ? "Reps: " + item.reps
                        : null}
                      {item.weight && !item.weight && !item.time
                        ? "Weight: " + item.weight
                        : null}
                      {item.time && !item.reps && !item.weight
                        ? item.time % 60 >= 10
                          ? "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.reps && item.weight && !item.time
                        ? "Reps: " + item.reps + "\n" + "Weight: " + item.weight
                        : null}
                      {item.reps && item.time && !item.weight
                        ? item.time % 60 >= 10
                          ? "Reps: " +
                            item.reps +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Reps: " +
                            item.reps +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.weight && item.time && !item.reps
                        ? item.time % 60 >= 10
                          ? "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                      {item.weight && item.time && item.reps
                        ? item.time % 60 >= 10
                          ? "Reps: " +
                            item.reps +
                            "\n" +
                            "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":" +
                            (item.time % 60)
                          : "Reps: " +
                            item.reps +
                            "\n" +
                            "Weight: " +
                            item.weight +
                            "\n" +
                            "Time: " +
                            Math.floor(item.time / 60) +
                            ":0" +
                            (item.time % 60)
                        : null}
                    </Text>
                  </View>
                )}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View
        style={{
          flex: 0.2,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "5%",
        }}
      >
        <SolidButton
          title="Compare with a Friend"
          onPress={() => {
            navigation.navigate("Modal Friend Picker", {
              friends: friends,
              friendsAverageStats: friendsAverageStats,
              friendsBestStats: friendsBestStats,
              friendsLatestStats: friendsLatestStats,
              updateFriend: updateFriend,
            });
          }}
        />
      </View>
      {friend ? (
        <View
          style={{
            flex: 0.2,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "5%",
          }}
        >
          <SecondaryButton
            title="Stop Comparing"
            onPress={() => {
              setFriend(null);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
