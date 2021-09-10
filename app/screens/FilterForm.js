import React from "react";
import { View, Text, Switch } from "react-native";
import { CheckBox } from "native-base";
import Slider from "react-native-slider";
import SolidButton from "../components/SolidButton";
import { DisplayMaxTime } from "../UtilityFunctions";
import { TouchableHighlight } from "react-native-gesture-handler";
import { set } from "react-native-reanimated";

export default function FilterForm({ navigation, route }) {
  const [workoutFilter, setWorkoutFilter] = React.useState(false);
  const [userFilter, setUserFilter] = React.useState(false);
  const [strengthFilter, setStrengthFilter] = React.useState(false);
  const [cardioFilter, setCardioFilter] = React.useState(false);
  const [yogaFilter, setYogaFilter] = React.useState(false);
  const [balanceFilter, setBalanceFilter] = React.useState(false);
  const [speedFilter, setSpeedFilter] = React.useState(false);
  const [equipmentless, setEquipmentless] = React.useState(false);
  const [timeLimit, setTimeLimit] = React.useState(false);

  var [maxTime, setMaxTime] = React.useState(1);

  return (
    <View>
      <Text style={{ margin: 10, fontSize: 30, fontWeight: "bold" }}>
        Filter
      </Text>
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Filter by Type</Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={workoutFilter ? true : false}
            onPress={() => {
              if (workoutFilter) {
                setUserFilter(false);
                setWorkoutFilter(false);
              } else {
                setUserFilter(false);
                setWorkoutFilter(true);
              }
            }}
          />
          <Text style={{ marginLeft: 20 }}>Workouts only</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={userFilter ? true : false}
            onPress={() => {
              if (userFilter) {
                setUserFilter(false);
                setWorkoutFilter(false);
              } else {
                setUserFilter(true);
                setWorkoutFilter(false);
              }
            }}
          />
          <Text style={{ marginLeft: 20 }}>Users only</Text>
        </View>
      </View>
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Filter by Category</Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={strengthFilter ? true : false}
            onPress={() =>
              strengthFilter
                ? setStrengthFilter(false)
                : setStrengthFilter(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>Strength</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={cardioFilter ? true : false}
            onPress={() =>
              cardioFilter ? setCardioFilter(false) : setCardioFilter(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>Cardio</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={yogaFilter ? true : false}
            onPress={() =>
              yogaFilter ? setYogaFilter(false) : setYogaFilter(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>Yoga</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={balanceFilter ? true : false}
            onPress={() =>
              balanceFilter ? setBalanceFilter(false) : setBalanceFilter(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>Balance</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={speedFilter ? true : false}
            onPress={() =>
              speedFilter ? setSpeedFilter(false) : setSpeedFilter(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>Speed</Text>
        </View>
      </View>
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Filter by equipment</Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <CheckBox
            color="blue"
            checked={equipmentless ? true : false}
            onPress={() =>
              equipmentless ? setEquipmentless(false) : setEquipmentless(true)
            }
          />
          <Text style={{ marginLeft: 20 }}>No equipment needed</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Time to Complete</Text>
          <View style={{ marginTop: 10, flexDirection: "row" }}>
            <CheckBox
              color="blue"
              checked={timeLimit ? true : false}
              onPress={() =>
                timeLimit ? setTimeLimit(false) : setTimeLimit(true)
              }
            />
            <Text style={{ marginLeft: 20 }}>Set a time limit</Text>
          </View>
          {timeLimit ? (
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "bold", margin: 10 }}>
                {DisplayMaxTime(maxTime)}
              </Text>
              <Slider
                value={maxTime}
                step={0.01}
                thumbTintColor="blue"
                onValueChange={(value) => {
                  setMaxTime(value);
                }}
                style={{ width: 200, height: 40 }}
              />
            </View>
          ) : null}
        </View>

        <View style={{ margin: 10, marginTop: 40 }}>
          <TouchableHighlight
            style={{
              backgroundColor: "blue",
              borderRadius: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              padding: 15,
            }}
            onPress={() => {
              let facetFilters = [];
              let numericFilters = [];
              workoutFilter
                ? (facetFilters = facetFilters.concat("type:workout"))
                : null;
              userFilter
                ? (facetFilters = facetFilters.concat("type:user"))
                : null;
              strengthFilter
                ? (facetFilters = facetFilters.concat("isStrength:true"))
                : null;
              cardioFilter
                ? (facetFilters = facetFilters.concat("isCardio:true"))
                : null;
              yogaFilter
                ? (facetFilters = facetFilters.concat("isYoga:true"))
                : null;
              balanceFilter
                ? (facetFilters = facetFilters.concat("isBalance:true"))
                : null;
              speedFilter
                ? (facetFilters = facetFilters.concat("isSpeed:true"))
                : null;
              if (equipmentless) {
                facetFilters = facetFilters.concat("isWeightNeeded:false");
                facetFilters = facetFilters.concat("isBarNeeded:false");
                facetFilters = facetFilters.concat("isChairNeeded:false");
                facetFilters = facetFilters.concat("isTowelNeeded:false");
                facetFilters = facetFilters.concat("isMatNeeded:false");
              }

              if (timeLimit) {
                let timeFilter = "lengthInMinutes" + Math.floor(maxTime * 90);
                numericFilters = numericFilters.concat(timeFilter);
              }

              navigation.navigate("Browse", {
                facetFilters: facetFilters,
                numericFilters: numericFilters,
              });
            }}
          >
            <Text style={{ color: "white" }}>Done</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}
