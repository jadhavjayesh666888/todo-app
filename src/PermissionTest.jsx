import React, { useEffect, useState } from 'react';
import { db } from './services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';

export default function PermissionTest() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    async function testWrite(collName, type) {
      try {
        await addDoc(collection(db, collName), {
          heading: 'Test',
          type: type,
          userId: currentUser.uid,
          createdAt: Date.now()
        });
        return { coll: collName, type: type, status: 'SUCCESS' };
      } catch (err) {
        return { coll: collName, type: type, status: 'FAIL', error: err.code };
      }
    }

    async function runTests() {
      const tests = [
        { coll: 'todos', type: 'link' },
        { coll: 'links', type: 'link' },
        { coll: 'social_links', type: 'link' },
        { coll: 'user_data', type: 'link' }
      ];
      const res = await Promise.all(tests.map(t => testWrite(t.coll, t.type)));
      setResults(res);
    }

    runTests();
  }, [currentUser]);

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2>Firestore Write Tests</h2>
      <ul>
        {results.map((r, i) => (
          <li key={i}>{r.coll} ({r.type}): {r.status} {r.error && `(${r.error})`}</li>
        ))}
      </ul>
    </div>
  );
}
