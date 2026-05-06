import "./App.css";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import { useState, useCallback } from "react";
import type { Database } from "./types/types";
import { initializeDatabase, persistDatabase } from "./utils/utils";

const App: React.FC = () => {
  const [database, setDatabaseRaw] = useState<Database>(initializeDatabase());

  const setDatabase: React.Dispatch<React.SetStateAction<Database>> =
    useCallback((action) => {
      setDatabaseRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        persistDatabase(next);
        return next;
      });
    }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            exact
            path="/"
            render={() => (
              <BoardPage database={database} setDatabase={setDatabase} />
            )}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
