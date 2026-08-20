import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Flame, Target, TrendingUp } from "lucide-react-native";
import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const features = [
  {
    icon: Flame,
    title: "Racha diaria",
    description: "Mantén tu momentum con seguimiento de rachas",
  },
  {
    icon: Target,
    title: "Metas claras",
    description: "Define y alcanza tus objetivos paso a paso",
  },
  {
    icon: TrendingUp,
    title: "Progreso visible",
    description: "Visualiza tu evolución con estadísticas",
  },
];

export default function Welcome() {
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const featuresOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    logoRotate.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }));
    featuresOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonsOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, [
    logoScale,
    logoRotate,
    textOpacity,
    textTranslateY,
    featuresOpacity,
    buttonsOpacity,
  ]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
    alignItems: "center" as const,
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    gap: 12,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    gap: 12,
  }));

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#4f46e5", "#6366f1", "#818cf8"]}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-between px-6 pb-10 pt-14">
          <Animated.View style={textAnimatedStyle}>
            <Animated.View
              style={logoAnimatedStyle}
              className="h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md"
            >
              <Text className="text-5xl font-bold text-white">M</Text>
            </Animated.View>
            <Text className="mt-6 text-4xl font-bold text-white">Momentum</Text>
            <Text className="mt-2 text-center text-base text-indigo-100">
              Construye hábitos y alcanza tus metas,{"\n"}un día a la vez.
            </Text>
          </Animated.View>

          <Animated.View style={featuresAnimatedStyle}>
            {features.map((feature) => (
              <View
                key={feature.title}
                className="flex-row items-center rounded-2xl bg-white/15 px-4 py-3.5"
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <feature.icon size={22} color="#ffffff" strokeWidth={2} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base font-semibold text-white">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-indigo-100">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={buttonsAnimatedStyle}>
            <Link href="/(auth)/register" asChild>
              <Pressable className="items-center rounded-2xl bg-white py-4 active:opacity-80">
                <Text className="text-base font-semibold text-indigo-600">
                  Crear cuenta
                </Text>
              </Pressable>
            </Link>

            <Link href="/(auth)/login" asChild>
              <Pressable className="items-center rounded-2xl border border-white/30 py-4 active:opacity-70">
                <Text className="text-base font-semibold text-white">
                  Ya tengo cuenta
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
