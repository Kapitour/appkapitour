import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

class Footer extends Component {
  render() {
    return <View style={styles.pezinho}></View>;
  }
}

export default Footer;

const styles = StyleSheet.create({
  pezinho: {
    backgroundColor: "#2c2c2c",
    width: "100%",
    height: 100,
    marginTop: 30,
  },
});
