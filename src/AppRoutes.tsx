import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAssistant } from './lib/AssistantContext';

import CalendarScreen from './screens/Calendar';
import HerbsScreen from './screens/Herbs';
import PointsScreen from './screens/Points';
import NotesScreen from './screens/Notes';
import SettingsScreen from './screens/Settings';
import TrabalhosScreen from './screens/Trabalhos';
import HomeScreen from './screens/Home';
import StudiesScreen from './screens/Studies';
import FinanceiroScreen from './screens/Financeiro';

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-[#001529]">
      <div className="w-12 h-12 border-4 border-t-brand-gold border-white/20 rounded-full animate-spin" />
    </div>
);

export const AppRoutes = () => {
    const { setIsScrolled } = useAssistant();

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 50);
    };

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/home" element={
                    <main 
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-48 w-full scrollbar-hide relative"
                    >
                        <HomeScreen />
                    </main>
                } />
                <Route path="*" element={
                    <main 
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-48 w-full scrollbar-hide relative"
                    >
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
                    </main>
                } />
            </Routes>
        </Suspense>
    );
};
