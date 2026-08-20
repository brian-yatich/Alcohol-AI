import { Activity, BarChart3, Bell, Calendar, MessageCircle, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { PillTabBar, TabDef } from './components/PillTabBar';
import { loadData, saveData } from './lib/storage';
import { Analysis } from './screens/Analysis';
import { Chat } from './screens/Chat';
import { CheckIn } from './screens/CheckIn';
import { Craving } from './screens/Craving';
import { Onboarding } from './screens/Onboarding';
import { Realtime } from './screens/Realtime';
import { colors } from './theme';
import { AppData } from './types';

type ViewMode = 'baseline' | 'tracking' | 'craving' | 'realtime' | 'analysis' | 'chat';

const TABS: TabDef[] = [
  { key: 'baseline', label: 'Baseline Setup', icon: User },
  { key: 'tracking', label: 'Daily Check-in', icon: Calendar },
  { key: 'craving', label: 'Craving Questionnaire', icon: Bell },
  { key: 'realtime', label: 'Real-Time Support', icon: Activity },
  { key: 'analysis', label: 'Analysis & Insights', icon: BarChart3 },
  { key: 'chat', label: 'Chat Support', icon: MessageCircle },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<ViewMode>('baseline');

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setView(d.baselineComplete ? 'tracking' : 'baseline');
      setLoading(false);
    });
  }, []);

  const persist = (next: AppData) => {
    setData(next);
    saveData(next);
  };

  if (loading || !data) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  const tabs = TABS.map((t) => ({
    ...t,
    locked: t.key !== 'baseline' && !data.baselineComplete,
  }));

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.shell} edges={['top']}>
        <AppHeader />
        <PillTabBar tabs={tabs} active={view} onChange={(k) => setView(k as ViewMode)} />
      </SafeAreaView>

      <SafeAreaView style={styles.content} edges={['bottom']}>
        {view === 'baseline' && (
          <Onboarding
            onComplete={(baseline) => {
              persist({ ...data, baseline, baselineComplete: true });
              setView('tracking');
            }}
          />
        )}

        {view === 'tracking' && (
          <CheckIn
            onSubmit={(entry) => {
              persist({ ...data, tracking: [...data.tracking, entry] });
              setView('craving');
            }}
          />
        )}

        {view === 'craving' && (
          <Craving
            onSubmit={(entry) => {
              persist({ ...data, craving: [...data.craving, entry] });
              setView('analysis');
            }}
          />
        )}

        {view === 'realtime' && (
          <Realtime
            onSubmit={(entry) => {
              persist({ ...data, realtime: [...data.realtime, entry] });
            }}
          />
        )}

        {view === 'analysis' && <Analysis tracking={data.tracking} craving={data.craving} />}

        {view === 'chat' && (
          <Chat
            baseline={data.baseline}
            latestTracking={data.tracking[data.tracking.length - 1]}
            latestRealtime={data.realtime[data.realtime.length - 1]}
            messages={data.chat}
            onMessagesChange={(chat) => persist({ ...data, chat })}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
});
