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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
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
      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          setUser({
            ...user,
            image: userData.image,
            name: userData.name,
            classes: userData.classes,
            role: userData.role,
          });
        }
      }
    }

    if (!user.account || user.role) {
      return;
    }
    if (user.account && user.role) {
      setIsLoading(false);
      return;
    }

    fetchUserData();
  }, [user]);

  // if (!user && isLoading) {
  //   return;
  // }
  // console.log(user);
  // console.log(isLoading);

  return (
    <UserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserInfoProvider;
