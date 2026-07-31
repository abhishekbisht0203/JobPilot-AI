import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
  withDelay, Easing,
} from 'react-native-reanimated';

function Float({ children, delay = 0, intensity = 6, style }: {
  children: React.ReactNode; delay?: number; intensity?: number; style?: any;
}) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-intensity, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
          withTiming(intensity, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      ),
    );
  }, [y, delay, intensity]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

const base = {
  width: 124,
  height: 140,
  position: 'relative' as const,
};

const styles = StyleSheet.create({
  illusBase: { ...base },
  decoCircle: { position: 'absolute', borderRadius: 999 },
  miniDot: { width: 7, height: 7, borderRadius: 4 },

  // ─── Resume Builder ───────────────────────────────────────
  rbPaper: {
    width: 86, height: 108, backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 11, transform: [{ rotate: '-6deg' }],
    shadowColor: '#3B0764', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28,
    shadowRadius: 12, elevation: 8,
  },
  rbAvatar: {
    width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  rbLine: { height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', marginBottom: 6 },
  rbCheck: {
    position: 'absolute', bottom: -7, right: -7, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  // ─── Cover Letter ─────────────────────────────────────────
  clPaper: {
    position: 'absolute', top: 8, left: 6, width: 58, height: 72, backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 8, transform: [{ rotate: '-10deg' }],
    shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 5,
  },
  clPaperLine: { height: 4, borderRadius: 2, backgroundColor: '#EDE9FE', marginBottom: 5 },
  clEnvelope: {
    position: 'absolute', bottom: 6, right: 2, width: 92, height: 64, backgroundColor: '#FFFFFF',
    borderRadius: 12, transform: [{ rotate: '7deg' }], overflow: 'hidden',
    shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25,
    shadowRadius: 10, elevation: 7, justifyContent: 'center', alignItems: 'center',
  },
  clMail: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF',
    justifyContent: 'center', alignItems: 'center',
  },
  clMini: {
    position: 'absolute', left: 0, bottom: 14, width: 30, height: 36, backgroundColor: '#FFFFFF',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18,
    shadowRadius: 6, elevation: 4,
  },

  // ─── Resume Checker ───────────────────────────────────────
  rcDoc: {
    position: 'absolute', top: 4, left: 2, width: 62, height: 78, backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 9, transform: [{ rotate: '-9deg' }],
    shadowColor: '#164E63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 5,
  },
  rcDocLine: { height: 4, borderRadius: 2, backgroundColor: '#E0F2FE', marginBottom: 5 },
  rcRing: {
    position: 'absolute', top: 12, right: -2, width: 56, height: 56, borderRadius: 28,
    borderWidth: 5, borderColor: '#0EA5E9', backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22,
    shadowRadius: 8, elevation: 6,
  },
  rcRingText: { fontSize: 17, fontWeight: '800', color: '#0284C7' },
  rcShield: {
    position: 'absolute', bottom: 8, right: 6, width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0369A1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3,
    shadowRadius: 9, elevation: 7,
  },
  rcCheck: {
    position: 'absolute', top: 0, right: 30, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  rcBars: {
    position: 'absolute', bottom: 2, left: 6, flexDirection: 'row', alignItems: 'flex-end',
    gap: 4, height: 34,
  },
  rcBar: { width: 7, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.85)' },

  // ─── Mock Interview ───────────────────────────────────────
  miWaves: {
    position: 'absolute', top: 14, left: 4, flexDirection: 'row', alignItems: 'center',
    gap: 3, height: 40,
  },
  miWave: { width: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  miBubble: {
    position: 'absolute', top: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', gap: 3,
    shadowColor: '#064E3B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18,
    shadowRadius: 6, elevation: 4,
  },
  miBubbleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  miRobot: {
    position: 'absolute', bottom: 6, right: 6, width: 66, height: 66, borderRadius: 20,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#064E3B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25,
    shadowRadius: 10, elevation: 7,
  },
  miAntenna: { position: 'absolute', top: -7, width: 3, height: 10, backgroundColor: '#059669', borderRadius: 2 },
  miEyes: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  miEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#065F46' },
  miMouth: { width: 18, height: 4, borderRadius: 2, backgroundColor: '#10B981' },
  miMic: {
    position: 'absolute', bottom: -9, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  // ─── Salary Explorer ──────────────────────────────────────
  seGlobe: {
    position: 'absolute', top: 2, right: 2, width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2,
    shadowRadius: 6, elevation: 4,
  },
  seDollar: {
    position: 'absolute', top: 28, left: 4, width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3,
    shadowRadius: 10, elevation: 7,
  },
  seDollarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  seBars: {
    position: 'absolute', bottom: 2, right: 2, flexDirection: 'row', alignItems: 'flex-end',
    gap: 5, height: 48,
  },
  seBar: { width: 9, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' },
  seCoin: {
    position: 'absolute', bottom: 4, left: 30, width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FDBA74',
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18,
    shadowRadius: 6, elevation: 4,
  },

  // ─── Career Roadmap ───────────────────────────────────────
  crPath: {
    position: 'absolute', top: 6, bottom: 8, left: 26, width: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  crFlag: {
    position: 'absolute', top: 0, right: 6, alignItems: 'center',
  },
  crFlagPole: { width: 3, height: 20, backgroundColor: '#FFFFFF', borderRadius: 2 },
  crFlagPoly: {
    width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 14,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#FFFFFF',
    marginTop: -2,
  },
  crPin: {
    position: 'absolute', top: 30, left: 18, width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#831843', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3,
    shadowRadius: 9, elevation: 7,
  },
  crTarget: {
    position: 'absolute', bottom: 14, right: 2, width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', borderWidth: 5, borderColor: '#FBCFE8',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#831843', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 5,
  },
  crMilestone: {
    position: 'absolute', top: 62, right: 24, width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#FDA4AF',
  },

  // ─── Interview Prep ───────────────────────────────────────
  ipBook: {
    position: 'absolute', bottom: 4, left: 2, width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 7, elevation: 5,
  },
  ipLaptop: {
    position: 'absolute', top: 4, right: 2, alignItems: 'center',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 7, elevation: 5,
  },
  ipScreen: {
    width: 56, height: 36, backgroundColor: '#FFFFFF', borderRadius: 7,
    borderWidth: 3, borderColor: '#BFDBFE', padding: 5, justifyContent: 'space-between',
  },
  ipScreenLine: { height: 3, borderRadius: 2, backgroundColor: '#DBEAFE' },
  ipBase: { width: 64, height: 5, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  ipQ: {
    position: 'absolute', bottom: 10, right: 8, width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3,
    shadowRadius: 10, elevation: 7,
  },
  ipQText: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  ipNotes: {
    position: 'absolute', top: 40, left: 2, width: 44, height: 52, backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 8,
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 7, elevation: 5,
  },
  ipNoteLine: { height: 4, borderRadius: 2, backgroundColor: '#DBEAFE', marginBottom: 5 },

  // ─── ATS Score ────────────────────────────────────────────
  asDoc: {
    position: 'absolute', top: 2, left: 2, width: 64, height: 80, backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 9, transform: [{ rotate: '-8deg' }],
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 5,
  },
  asDocLine: { height: 4, borderRadius: 2, backgroundColor: '#FFEDD5', marginBottom: 5 },
  asRing: {
    position: 'absolute', top: 18, right: -4, width: 56, height: 56, borderRadius: 28,
    borderWidth: 5, borderColor: '#FB923C', backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22,
    shadowRadius: 8, elevation: 6,
  },
  asRingText: { fontSize: 13, fontWeight: '800', color: '#EA580C' },
  asShield: {
    position: 'absolute', bottom: 8, right: 8, width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32,
    shadowRadius: 10, elevation: 8,
  },
  asAiBadge: {
    position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5,
    shadowColor: '#7C2D12', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2,
    shadowRadius: 6, elevation: 4,
  },
  asAiText: { fontSize: 11, fontWeight: '800', color: '#EA580C' },
});

// ─── Page 1: AI Resume Builder ──────────────────────────────────────
export function ResumeBuilderIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: -6, right: -4, width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 10, left: -8, width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={250} intensity={8} style={{ position: 'absolute', top: 2, left: 4 }}>
        <Ionicons name="sparkles" size={18} color="#FFD66B" />
      </Float>
      <Float delay={600} intensity={5} style={{ position: 'absolute', top: 42, right: 0 }}>
        <View style={[styles.miniDot, { backgroundColor: '#FFD66B' }]} />
      </Float>
      <Float delay={100} intensity={5} style={{ position: 'absolute', top: 18, left: 10 }}>
        <View style={styles.rbPaper}>
          <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.rbAvatar}>
            <Ionicons name="person" size={14} color="#FFF" />
          </LinearGradient>
          <View style={[styles.rbLine, { width: '80%' }]} />
          <View style={[styles.rbLine, { width: '58%' }]} />
          <View style={[styles.rbLine, { width: '70%' }]} />
          <View style={styles.rbCheck}>
            <Ionicons name="checkmark" size={13} color="#FFF" />
          </View>
        </View>
      </Float>
    </View>
  );
}

// ─── Page 2: Cover Letter ───────────────────────────────────────────
export function CoverLetterIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: -4, right: 6, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 4, left: -6, width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={350} intensity={8} style={{ position: 'absolute', top: 2, right: 0 }}>
        <Ionicons name="sparkles" size={17} color="#FFD66B" />
      </Float>
      <Float delay={150} intensity={4} style={styles.clPaper}>
        <View style={styles.clPaperLine} />
        <View style={[styles.clPaperLine, { width: '70%' }]} />
      </Float>
      <Float delay={400} intensity={3} style={styles.clMini}>
        <Ionicons name="document-text" size={14} color="#8B5CF6" />
      </Float>
      <Float delay={250} intensity={6} style={styles.clEnvelope}>
        <View style={{ width: 0, height: 0, position: 'absolute', top: 0, left: 0,
          borderLeftWidth: 46, borderRightWidth: 46, borderTopWidth: 20,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#EDE9FE' }} />
        <View style={styles.clMail}>
          <Ionicons name="mail" size={22} color="#8B5CF6" />
        </View>
      </Float>
    </View>
  );
}

// ─── Page 3: Resume Checker ─────────────────────────────────────────
export function ResumeCheckerIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: -4, right: 2, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 6, left: -8, width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={300} intensity={7} style={{ position: 'absolute', top: 0, right: 34 }}>
        <Ionicons name="sparkles" size={16} color="#FFD66B" />
      </Float>
      <Float delay={150} intensity={4} style={styles.rcDoc}>
        <View style={styles.rcDocLine} />
        <View style={[styles.rcDocLine, { width: '62%' }]} />
        <View style={[styles.rcDocLine, { width: '78%' }]} />
      </Float>
      <Float delay={500} intensity={5} style={styles.rcCheck}>
        <Ionicons name="checkmark" size={13} color="#FFF" />
      </Float>
      <Float delay={250} intensity={6} style={styles.rcRing}>
        <Text style={styles.rcRingText}>92</Text>
      </Float>
      <Float delay={420} intensity={7} style={styles.rcShield}>
        <Ionicons name="shield-checkmark" size={26} color="#FFF" />
      </Float>
      <View style={styles.rcBars}>
        <View style={[styles.rcBar, { height: 14 }]} />
        <View style={[styles.rcBar, { height: 24 }]} />
        <View style={[styles.rcBar, { height: 32 }]} />
      </View>
    </View>
  );
}

// ─── Page 4: Mock Interview ─────────────────────────────────────────
export function MockInterviewIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: 2, left: -6, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 2, right: -4, width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={300} intensity={7} style={{ position: 'absolute', top: 2, left: 30 }}>
        <Ionicons name="sparkles" size={15} color="#FFD66B" />
      </Float>
      <Float delay={150} intensity={4} style={styles.miWaves}>
        <View style={[styles.miWave, { height: 14 }]} />
        <View style={[styles.miWave, { height: 24 }]} />
        <View style={[styles.miWave, { height: 34 }]} />
        <View style={[styles.miWave, { height: 22 }]} />
        <View style={[styles.miWave, { height: 14 }]} />
      </Float>
      <Float delay={250} intensity={5} style={styles.miBubble}>
        <View style={styles.miBubbleDot} />
        <View style={[styles.miBubbleDot, { opacity: 0.6 }]} />
        <View style={[styles.miBubbleDot, { opacity: 0.3 }]} />
      </Float>
      <Float delay={400} intensity={7} style={styles.miRobot}>
        <View style={styles.miAntenna} />
        <View style={styles.miEyes}>
          <View style={styles.miEye} />
          <View style={styles.miEye} />
        </View>
        <View style={styles.miMouth} />
        <View style={styles.miMic}>
          <Ionicons name="mic" size={12} color="#FFF" />
        </View>
      </Float>
    </View>
  );
}

// ─── Page 5: Salary Explorer ────────────────────────────────────────
export function SalaryExplorerIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: 0, left: 4, width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 8, right: -6, width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={300} intensity={7} style={{ position: 'absolute', top: 40, right: 0 }}>
        <Ionicons name="trending-up" size={18} color="#FFD66B" />
      </Float>
      <Float delay={150} intensity={5} style={styles.seGlobe}>
        <Ionicons name="globe" size={20} color="#EA580C" />
      </Float>
      <Float delay={250} intensity={6} style={styles.seDollar}>
        <Text style={styles.seDollarText}>$</Text>
      </Float>
      <Float delay={500} intensity={4} style={styles.seCoin}>
        <Ionicons name="cash" size={14} color="#EA580C" />
      </Float>
      <View style={styles.seBars}>
        <View style={[styles.seBar, { height: 14 }]} />
        <View style={[styles.seBar, { height: 26 }]} />
        <View style={[styles.seBar, { height: 40 }]} />
        <View style={[styles.seBar, { height: 20 }]} />
      </View>
    </View>
  );
}

// ─── Page 6: Career Roadmap ─────────────────────────────────────────
export function CareerRoadmapIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: 2, right: 2, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 4, left: -6, width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={200} intensity={6} style={{ position: 'absolute', top: 48, right: 0 }}>
        <Ionicons name="sparkles" size={15} color="#FFD66B" />
      </Float>
      <View style={styles.crPath} />
      <Float delay={150} intensity={5} style={styles.crFlag}>
        <View style={styles.crFlagPole} />
        <View style={styles.crFlagPoly} />
      </Float>
      <Float delay={300} intensity={7} style={styles.crPin}>
        <Ionicons name="location" size={18} color="#FFF" />
      </Float>
      <Float delay={500} intensity={4} style={styles.crMilestone}>
        <View />
      </Float>
      <Float delay={420} intensity={6} style={styles.crTarget}>
        <Ionicons name="locate" size={18} color="#DB2777" />
      </Float>
    </View>
  );
}

// ─── Page 7: Interview Prep ─────────────────────────────────────────
export function InterviewPrepIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: -4, right: 4, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 6, left: -6, width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={400} intensity={8} style={{ position: 'absolute', top: 36, right: 0 }}>
        <Ionicons name="bulb" size={19} color="#FFD66B" />
      </Float>
      <Float delay={500} intensity={4} style={styles.ipBook}>
        <Ionicons name="book" size={20} color="#2563EB" />
      </Float>
      <Float delay={200} intensity={5} style={styles.ipLaptop}>
        <View style={styles.ipScreen}>
          <View style={styles.ipScreenLine} />
          <View style={[styles.ipScreenLine, { width: '60%' }]} />
        </View>
        <View style={styles.ipBase} />
      </Float>
      <Float delay={300} intensity={4} style={styles.ipNotes}>
        <View style={styles.ipNoteLine} />
        <View style={[styles.ipNoteLine, { width: '70%' }]} />
        <View style={[styles.ipNoteLine, { width: '85%' }]} />
      </Float>
      <Float delay={150} intensity={6} style={styles.ipQ}>
        <Text style={styles.ipQText}>?</Text>
      </Float>
    </View>
  );
}

// ─── Page 8: ATS Score ──────────────────────────────────────────────
export function ATSScoreIllus() {
  return (
    <View style={styles.illusBase}>
      <View style={[styles.decoCircle, { top: -4, left: 4, width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      <View style={[styles.decoCircle, { bottom: 6, right: -6, width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.10)' }]} />
      <Float delay={350} intensity={7} style={{ position: 'absolute', top: 2, right: 34 }}>
        <Ionicons name="sparkles" size={16} color="#FFD66B" />
      </Float>
      <Float delay={150} intensity={4} style={styles.asDoc}>
        <View style={styles.asDocLine} />
        <View style={[styles.asDocLine, { width: '62%' }]} />
        <View style={[styles.asDocLine, { width: '78%' }]} />
      </Float>
      <Float delay={250} intensity={6} style={styles.asRing}>
        <Text style={styles.asRingText}>ATS</Text>
      </Float>
      <Float delay={420} intensity={7} style={styles.asShield}>
        <Ionicons name="shield-checkmark" size={28} color="#FFF" />
      </Float>
      <Float delay={550} intensity={5} style={styles.asAiBadge}>
        <Ionicons name="sparkles" size={11} color="#EA580C" />
        <Text style={styles.asAiText}>AI</Text>
      </Float>
    </View>
  );
}

export type HeroIllustrationName =
  | 'resume-builder'
  | 'cover-letter'
  | 'resume-checker'
  | 'mock-interview'
  | 'salary-explorer'
  | 'career-roadmap'
  | 'interview-prep'
  | 'ats-score';

export function HeroIllustration({ name }: { name: HeroIllustrationName }) {
  switch (name) {
    case 'resume-builder': return <ResumeBuilderIllus />;
    case 'cover-letter': return <CoverLetterIllus />;
    case 'resume-checker': return <ResumeCheckerIllus />;
    case 'mock-interview': return <MockInterviewIllus />;
    case 'salary-explorer': return <SalaryExplorerIllus />;
    case 'career-roadmap': return <CareerRoadmapIllus />;
    case 'interview-prep': return <InterviewPrepIllus />;
    case 'ats-score': return <ATSScoreIllus />;
  }
}
