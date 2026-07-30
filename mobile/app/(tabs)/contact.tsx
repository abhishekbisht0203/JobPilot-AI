import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, withSpring, withTiming, useAnimatedStyle, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadow } from '../../lib/theme';
import { useResponsive } from '../../lib/responsive';
import { MeshGradient } from '../../components/ui/MeshGradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getTabListBottomPadding } from '../../components/ui/TabBarHeight';
import { contactApi } from '../../lib/api';
import { useAuthStore } from '../../store';

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
  color: string;
  gradient: readonly [string, string];
  action: () => void;
}

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'How do I upgrade my plan?',
    answer: 'Go to the Pricing page from your Profile settings, select your desired plan, and complete the payment. Your new features will be available immediately.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime from your Profile settings. Your access will continue until the end of the current billing period.',
  },
  {
    question: 'How does the AI resume analysis work?',
    answer: 'Upload your resume and our AI analyzes it against job descriptions, providing an ATS score, keyword matching, and actionable suggestions for improvement.',
  },
  {
    question: "What's the refund policy?",
    answer: 'We offer a 14-day money-back guarantee on all paid plans. Contact our support team within 14 days of purchase for a full refund.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption, never share your data with third parties, and you can delete your account and all associated data at any time.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'You can request account deletion from your Privacy & Security settings. Your data will be permanently removed within 30 days.',
  },
];

const OFFICE_LOCATIONS = [
  { city: 'San Francisco, CA', address: '548 Market St, Suite 98201', hours: 'Mon-Fri 9AM-6PM PST', icon: 'business' },
  { city: 'New York, NY', address: '350 Fifth Avenue, 34th Floor', hours: 'Mon-Fri 9AM-6PM EST', icon: 'business' },
  { city: 'London, UK', address: '71 Queen Victoria Street', hours: 'Mon-Fri 9AM-6PM GMT', icon: 'business' },
];

function AccordionItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);
  const rotate = useSharedValue(0);

  const toggle = () => {
    if (open) {
      height.value = withTiming(0, { duration: 200 });
      rotate.value = withTiming(0, { duration: 200 });
    } else {
      height.value = withTiming(120, { duration: 300 });
      rotate.value = withTiming(180, { duration: 200 });
    }
    setOpen(!open);
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(600 + index * 60).springify().damping(14)}>
      <TouchableOpacity
        style={styles.faqItem}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Animated.View style={arrowStyle}>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </Animated.View>
        </View>
        <Animated.View style={[styles.faqBody, bodyStyle]}>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ContactInfoCard({ item, index }: { item: ContactInfo; index: number }) {
  const scale = useSharedValue(1);

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 80).springify().damping(14)} style={{ width: '48%' }}>
      <TouchableOpacity
        onPress={item.action}
        onPressIn={() => { scale.value = withSpring(0.95, { stiffness: 400, damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 15 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[styles.contactCard, { transform: [{ scale }] }]}>
          <BlurView intensity={50} tint="light" style={styles.contactCardInner}>
            <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.contactIcon}>
              <Ionicons name={item.icon as any} size={20} color="#FFF" />
            </LinearGradient>
            <Text style={styles.contactLabel}>{item.label}</Text>
            <Text style={styles.contactValue} numberOfLines={1}>{item.value}</Text>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isTablet } = useResponsive();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const contactInfo: ContactInfo[] = [
    {
      icon: 'mail-outline', label: 'Email', value: 'hello@jobpilot.ai',
      color: colors.primary, gradient: colors.gradient.blue,
      action: () => Linking.openURL('mailto:hello@jobpilot.ai'),
    },
    {
      icon: 'call-outline', label: 'Phone', value: '+1 (555) 123-4567',
      color: colors.success, gradient: colors.gradient.success,
      action: () => Linking.openURL('tel:+15551234567'),
    },
    {
      icon: 'logo-whatsapp', label: 'WhatsApp', value: '+1 (555) 987-6543',
      color: colors.accent.teal, gradient: colors.gradient.teal,
      action: () => Linking.openURL('https://wa.me/15559876543'),
    },
    {
      icon: 'location-outline', label: 'Office', value: 'San Francisco, CA',
      color: colors.secondary, gradient: colors.gradient.purple,
      action: () => Linking.openURL('https://maps.google.com/?q=548+Market+St+San+Francisco'),
    },
  ];

  const handleSubmit = useCallback(async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await contactApi.submit({ name, email, subject, message });
      Alert.alert('Sent!', 'Your message has been received. We\'ll get back to you within 24 hours.');
      setName(user?.name || '');
      setEmail(user?.email || '');
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert('Error', 'Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }, [name, email, subject, message, user]);

  return (
    <View style={styles.container}>
      <MeshGradient opacity={0.3} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: getTabListBottomPadding() + spacing.md,
          paddingHorizontal: horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>We're here to help you succeed</Text>
        </Animated.View>

        <View style={styles.contactGrid}>
          {contactInfo.map((item, index) => (
            <ContactInfoCard key={item.label} item={item} index={index} />
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(350).springify().damping(14)}>
          <TouchableOpacity activeOpacity={0.9}>
            <GlassCard style={styles.liveChatCard} glowColor={colors.accent.teal}>
              <View style={styles.liveChatRow}>
                <LinearGradient colors={['#14B8A6', '#06B6D4']} style={styles.liveChatIcon}>
                  <Ionicons name="chatbubbles" size={22} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <View style={styles.liveChatHeader}>
                    <Text style={styles.liveChatTitle}>Live Chat</Text>
                    <Badge label="Online" variant="success" size="sm" animated />
                  </View>
                  <Text style={styles.liveChatText}>Chat with our support team in real-time</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Send us a message</Text>
          <GlassCard style={styles.formCard}>
            <Input
              label="Your Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              icon="person-outline"
            />
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="What's this about?"
              icon="chatbox-ellipses-outline"
            />
            <Input
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us more about your inquiry..."
              icon="document-text-outline"
              multiline
              numberOfLines={4}
            />
            <Button
              title="Send Message"
              onPress={handleSubmit}
              variant="primary"
              gradient
              fullWidth
              loading={submitting}
              icon={<Ionicons name="send" size={16} color="#FFF" />}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Support Hours</Text>
          <GlassCard style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.hoursIcon}>
                <Ionicons name="time-outline" size={22} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.hoursTitle}>Typical response time: 2-4 hours</Text>
                <View style={styles.hoursDetails}>
                  <View style={styles.hoursDay}>
                    <Text style={styles.hoursDayLabel}>Mon - Fri</Text>
                    <Text style={styles.hoursDayValue}>9:00 AM - 6:00 PM</Text>
                  </View>
                  <View style={styles.hoursDay}>
                    <Text style={styles.hoursDayLabel}>Saturday</Text>
                    <Text style={styles.hoursDayValue}>10:00 AM - 4:00 PM</Text>
                  </View>
                  <View style={styles.hoursDay}>
                    <Text style={styles.hoursDayLabel}>Sunday</Text>
                    <Text style={styles.hoursDayValue}>Closed</Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Our Offices</Text>
          <View style={styles.officesGrid}>
            {OFFICE_LOCATIONS.map((office, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(500 + index * 80).springify().damping(14)}
                style={{ width: isTablet ? '31%' : '100%' }}
              >
                <GlassCard style={styles.officeCard} glowColor={colors.primary}>
                  <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.officeIconSm}>
                    <Ionicons name={office.icon as any} size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.officeCity}>{office.city}</Text>
                  <Text style={styles.officeAddress}>{office.address}</Text>
                  <Text style={styles.officeHours}>{office.hours}</Text>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550).springify().damping(14)}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <GlassCard style={styles.faqCard}>
            {FAQS.map((faq, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.faqDivider} />}
                <AccordionItem faq={faq} index={index} />
              </React.Fragment>
            ))}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 4, lineHeight: 20 },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.text,
    marginTop: spacing.xl, marginBottom: spacing.md, letterSpacing: -0.3,
  },
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.lg },
  contactCard: { borderRadius: borderRadius.xl, overflow: 'hidden', ...shadow.md },
  contactCardInner: { padding: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden' },
  contactIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  contactLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  contactValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 1 },
  liveChatCard: { padding: spacing.md, marginTop: spacing.sm },
  liveChatRow: { flexDirection: 'row', alignItems: 'center' },
  liveChatIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  liveChatHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  liveChatTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  liveChatText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  formCard: { padding: spacing.md },
  hoursCard: { padding: spacing.md },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hoursIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  hoursTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  hoursDetails: { gap: spacing.xs },
  hoursDay: { flexDirection: 'row', justifyContent: 'space-between' },
  hoursDayLabel: { fontSize: 13, color: colors.textSecondary },
  hoursDayValue: { fontSize: 13, color: colors.text, fontWeight: '500' },
  officesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  officeCard: { padding: spacing.md },
  officeIconSm: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  officeCity: { fontSize: 16, fontWeight: '600', color: colors.text },
  officeAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  officeHours: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  faqCard: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  faqItem: { paddingVertical: spacing.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '500', color: colors.text, flex: 1, marginRight: spacing.sm },
  faqBody: { overflow: 'hidden' },
  faqAnswer: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: spacing.sm },
  faqDivider: { height: 1, backgroundColor: colors.borderLight },
});
