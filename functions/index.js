const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createCustomUser = functions.https.onCall(async (data, context) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: data.email,
      // emailVerified: false,
      // phoneNumber: data.phoneNumber || '',
      password: data.email,
      // displayName: data.name,
      // photoURL: data.photoURL || '',
      // disabled: false,
    });

    await admin.firestore().collection("users").doc(userRecord.email).set({
      role: "student",
      account: data.email,
      image: "",
      uid: userRecord.uid,
      name: data.name,
      createdBy: data.selectedTeacher,
      classes: [data.selectedClass],
      badge: { collected: [""], outdated: [""] },
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error(`Error creating user: ${data.email}`, error);
    return { success: false, error: error.message };
  }
});
