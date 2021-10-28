import React from "react";
import { View, Text, Switch, ScrollView, Pressable } from "react-native";
import Slider from "react-native-slider";
import SolidButton from "../components/SolidButton";
import Header from "../components/Header";
import { DisplayMaxTime } from "../UtilityFunctions";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "@react-navigation/native";

export default function FilterForm({ navigation, route }) {
  const { colors } = useTheme();

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
    <View style={{ flex: 1 }}>
      <Header title="Add Filters" navigation={navigation} />
      <ScrollView>
        <View style={{ flexDirection: "row", flex: 1 }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 18 }}>
            <View style={{}}>
              <View style={{ height: 50, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  Filter by Workout length in time
                </Text>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Text style={{ fontWeight: "bold", paddingRight: 20 }}>
                  {"Time: " + DisplayMaxTime(maxTime)}
                </Text>
                <Slider
                  value={maxTime}
                  step={0.01}
                  thumbTintColor={colors.primary}
                  onValueChange={(value) => {
                    setMaxTime(value);
                  }}
                  style={{ width: 220, height: 20 }}
                />
              </View>
            </View>
            <View style={{ height: 50, justifyContent: "center" }}>
              <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                Filter by Type
              </Text>
            </View>
            <View style={{ height: 35 }}>
              <Pressable
                onPress={() => {
                  if (workoutFilter) {
                    setUserFilter(false);
                    setWorkoutFilter(false);
                  } else {
                    setUserFilter(false);
                    setWorkoutFilter(true);
                  }
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <BouncyCheckbox
                    isChecked={workoutFilter}
                    size={25}
                    fillColor={colors.primary}
                    unfillColor="#FFFFFF"
                    iconStyle={{ borderColor: colors.primary }}
                    textStyle={{}}
                    disableBuiltInState
                  />
                  <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                    Workouts only
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={{ height: 35 }}>
              <Pressable
                onPress={() => {
                  if (userFilter) {
                    setUserFilter(false);
                    setWorkoutFilter(false);
                  } else {
                    setUserFilter(true);
                    setWorkoutFilter(false);
                  }
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <BouncyCheckbox
                    isChecked={userFilter}
                    size={25}
                    fillColor={colors.primary}
                    unfillColor="#FFFFFF"
                    iconStyle={{ borderColor: colors.primary }}
                    textStyle={{}}
                    disableBuiltInState
                  />
                  <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                    Users only
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={{}}>
              <View style={{ height: 50, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  Filter by Category
                </Text>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setStrengthFilter(!strengthFilter)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={strengthFilter}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                      Strength
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setCardioFilter(!cardioFilter)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={cardioFilter}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                      Cardio
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setYogaFilter(!yogaFilter)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={yogaFilter}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>Yoga</Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setBalanceFilter(!balanceFilter)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={balanceFilter}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                      Balance
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setSpeedFilter(!speedFilter)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={speedFilter}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>Speed</Text>
                  </View>
                </Pressable>
              </View>
            </View>
            <View style={{}}>
              <View style={{ height: 50, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  Filter by equipment
                </Text>
              </View>

              <View style={{ flexDirection: "row", height: 35 }}>
                <Pressable onPress={() => setEquipmentless(!equipmentless)}>
                  <View style={{ flexDirection: "row" }}>
                    <BouncyCheckbox
                      isChecked={equipmentless}
                      size={25}
                      fillColor={colors.primary}
                      unfillColor="#FFFFFF"
                      iconStyle={{ borderColor: colors.primary }}
                      textStyle={{}}
                      disableBuiltInState
                    />
                    <Text style={{ paddingLeft: 15, fontSize: 16 }}>
                      No equipment needed
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
      </ScrollView>
      <View style={{ alignItems: "center" }}>
        <SolidButton
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
          title="Done"
        />
      </View>
    </View>
  );
}
