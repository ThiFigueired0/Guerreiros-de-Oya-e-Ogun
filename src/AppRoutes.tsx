import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy } from 'react';

const CalendarScreen = lazy(() => import('./screens/Calendar'));
const HerbsScreen = lazy(() => import('./screens/Herbs'));
const PointsScreen = lazy(() => import('./screens/Points'));
const NotesScreen = lazy(() => import('./screens/Notes'));
const SettingsScreen = lazy(() => import('./screens/Settings'));
const TrabalhosScreen = lazy(() => import('./screens/Trabalhos'));
const HomeScreen = lazy(() => import('./screens/Home'));
const StudiesScreen = lazy(() => import('./screens/Studies'));
const FinanceiroScreen = lazy(() => import('./screens/Financeiro'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-[#001529]">
      <div className="w-12 h-12 border-4 border-t-brand-gold border-white/20 rounded-full animate-spin" />
    </div>
);

export const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/home" element={
                    <main className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-48 px-4 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <HomeScreen />
                        </AnimatePresence>
                    </main>
                } />
                <Route path="*" element={
                    <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-48 px-4 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route path="/" element={<Navigate to="/home" replace />} />
                                <Route path="/calendar" element={<CalendarScreen />} />
                                <Route path="/herbs" element={<HerbsScreen />} />
                                <Route path="/trab" element={<TrabalhosScreen />} />
                                <Route path="/points" element={<PointsScreen />} />
                                <Route path="/studies" element={<StudiesScreen />} />
                                <Route path="/notes" element={<NotesScreen />} />
                                <Route path="/finance" element={<FinanceiroScreen />} />
                                <Route path="/settings" element={<SettingsScreen />} />
                            </Routes>
                        </AnimatePresence>
                    </main>
                } />
            </Routes>
        </Suspense>
    );
};
