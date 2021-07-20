const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");

admin.initializeApp();

const ALGOLIA_APP_ID = "1F3XZA4W9N";
const ALGOLIA_ADMIN_KEY = "84e9912d9e5dd10b8075a7e003b2f421";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const searchIndex = client.initIndex("searchIndex");

exports.syncWorkoutsToAlgolia = functions.firestore
  .document("workouts/{id}")
  .onWrite(async (change, context) => {
    try {
      if (change.after.exists) {
        const object = {
          ...change.after.data(),
          type: "workout",
          objectID: context.params.id,
        };
        if (object.deleted) {
          console.log("deleting...");
          await searchIndex.deleteObject(context.params.id);
        }
        if (object.published) {
          console.log("saving...");
          await searchIndex.saveObject(object);
        }
      } else {
        console.log("deleting...");
        await searchIndex.deleteObject(context.params.id);
      }
    } catch (error) {
      console.log(error);
    }
  });

exports.syncUsersToAlgolia = functions.firestore
  .document("users/{id}")
  .onWrite(async (change, context) => {
    try {
      if (change.after.exists) {
        const object = {
          ...change.after.data(),
          type: "user",
          objectID: context.params.id,
        };
        if (object.deleted) {
          console.log("deleting...");
          await searchIndex.deleteObject(context.params.id);
        }
        console.log("saving...");
        await searchIndex.saveObject(object);
      } else {
        console.log("deleting...");
        await searchIndex.deleteObject(context.params.id);
      }
    } catch (error) {
      console.log(error);
    }
  });
