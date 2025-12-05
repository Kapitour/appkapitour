import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function Button({ variant = "primary", onPress, icon, children, style }) {
  const bg = variant === "primary" ? colors.accent : variant === "secondary" ? colors.badgeBg : "transparent";
  const border = variant === "ghost" ? { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" } : null;
  const textColor = variant === "ghost" ? colors.text : "#fff";
  return (
    <TouchableOpacity onPress={onPress} style={[{ backgroundColor: bg, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: "center" }, border, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
        <Text style={{ color: textColor, fontWeight: "bold", fontSize: 16 }}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
}