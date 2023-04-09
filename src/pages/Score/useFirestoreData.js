// useFirestoreData.js
import { useState, useEffect } from "react";
import { collectionGroup, query, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";

const useFirestoreData = (collectionName) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collectionGroup(db, collectionName));
      const querySnapshot = await getDocs(q);

      const fetchedData = {};
      querySnapshot.forEach((doc) => {
        fetchedData[doc.id] = doc.data();
      });

      setData(fetchedData);
    };

    fetchData();
  }, [collectionName]);

  return data;
};

export default useFirestoreData;
