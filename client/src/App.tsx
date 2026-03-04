import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import FloorPlanList from "./pages/FloorPlanList";
import UploadFloorPlan from "./pages/UploadFloorPlan";
import FloorPlanDetail from "./pages/FloorPlanDetail";
import RenderJobDetail from "./pages/RenderJobDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FloorPlanList />} />
        <Route path="/upload" element={<UploadFloorPlan />} />
        <Route path="/floorplans/:id" element={<FloorPlanDetail />} />
        <Route path="/renders/:id" element={<RenderJobDetail />} />
      </Routes>
    </Layout>
  );
}
