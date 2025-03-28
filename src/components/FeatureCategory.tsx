import React from "react";
import { View, Text, FlatList } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const FeatureCategory = ({ title, features }: any) => {
    return (
        <View style={{ padding: 10 }}>
            {features.length > 0 && (
                <Text style={{ fontSize: 18, fontWeight: "bold", textTransform: "capitalize", marginBottom: 5 }}>
                    {title || "No Title"}
                </Text>
            )}
            <FlatList
                data={features}
                nestedScrollEnabled={true}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
                        <Icon name="check-circle" size={15} color="#010153" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 16 }}>{item || "No feature"}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default FeatureCategory;