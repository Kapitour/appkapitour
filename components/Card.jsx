import React, { useState } from "react";
import { View, Text, ImageBackground, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAccessibility } from "../src/accessibility/AccessibilityContext";

export default function Card({ imageUrl, title, description, children, showBack, onBack, style }) {
  const { state } = useAccessibility();
  const fontScale = state.fontScale || 1;
  const [loaded, setLoaded] = useState(false);
  return (
    <ImageBackground
      source={imageUrl ? { uri: imageUrl } : undefined}
      style={[{ width: "100%", borderRadius: 16, overflow: "hidden", position: "relative" }, style]}
      imageStyle={{ resizeMode: "cover" }}
      onLoadEnd={() => setLoaded(true)}
    >
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={{ position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.4)", padding: 10, borderRadius: 24, zIndex: 2 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      ) : null}
      {!loaded && imageUrl ? (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : null}
      <View style={{ padding: 16, backgroundColor: "rgba(0,0,0,0.45)", flex: 1, justifyContent: "flex-end" }}>
        {title ? <Text style={{ color: colors.text, fontSize: Math.round(20 * fontScale), fontWeight: "bold", marginBottom: 6 }}>{title}</Text> : null}
        {description ? <Text style={{ color: colors.textMuted, marginBottom: 12, fontSize: Math.round(14 * fontScale) }}>{description}</Text> : null}
        {children}
      </View>
    </ImageBackground>
  );
}
