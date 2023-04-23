import { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./utils/firebaseApp";
export const UserContext = createContext({});

const UserInfoProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      console.log("usecontext_user", user);
      if (user) {
        const data = {
          name: user.name || "",
          account: user.email || "",
          image: user.photoURL || "",
          uid: user.uid || "",
          classes: user.classes || [],
        };
        setUser(data);
        setIsLogin(true);
      } else {
        setUser({});
        setIsLogin(false);
      }
    });
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (user.role) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          setUser({
            ...user,
            role: userData.role,
          });
        }
      }
    }

    fetchUserData();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserInfoProvider;
