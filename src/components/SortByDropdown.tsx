import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Auction {
    _id: string;
    auctionTitle: string;
    auctionDate: string;
    auctionTime: string;
    statusText?: string;
}

interface SortByDropdownProps {
    onChange: (value: string) => void;
    preselected?: string;
    backendURL: string;
}

const SortByDropdown: React.FC<SortByDropdownProps> = ({ onChange, preselected, backendURL }) => {
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [options, setOptions] = useState<Auction[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        const getAllAuctions = async () => {
            try {
                const response = await fetch(`${backendURL}/auction`);
                const res_data = await response.json();

                if (response.ok) {
                    const sortedOptions = res_data
                        .map((auction: Auction) => ({
                            ...auction,
                            fullAuctionDate: new Date(`${auction.auctionDate} ${auction.auctionTime}`),
                        }))
                        .sort((a: { fullAuctionDate: { getTime: () => number; }; }, b: { fullAuctionDate: { getTime: () => number; }; }) => a.fullAuctionDate.getTime() - b.fullAuctionDate.getTime())
                        .filter((auction: { statusText: string; }) => auction.statusText?.toLowerCase() !== "completed");

                    setOptions(sortedOptions);

                    if (preselected && !initialized) {
                        const auctionExists = sortedOptions.some((auction: { auctionTitle: string; }) => auction.auctionTitle === preselected);
                        if (auctionExists) {
                            setSelectedOption(preselected);
                            onChange(preselected);
                            setInitialized(true);
                        }
                    } else if (!preselected && sortedOptions.length > 0 && !initialized) {
                        setSelectedOption(sortedOptions[0].auctionTitle);
                        onChange(sortedOptions[0].auctionTitle);
                        setInitialized(true);
                    }
                } else {
                    console.error("Failed to fetch auctions:", res_data.message);
                }
            } catch (error) {
                console.error("Error fetching auctions:", error);
            }
        };

        getAllAuctions();
    }, [preselected, onChange, initialized, backendURL]);

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        onChange(value);
    };

    return (
        <View style={styles.container}>
            <Picker
                dropdownIconColor="black"
                selectedValue={selectedOption}
                onValueChange={handleOptionChange}
                style={styles.picker}
            >
                {options.map((option) => (
                    <Picker.Item key={option._id} label={option.auctionTitle} value={option.auctionTitle} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignSelf: "flex-start",
    },
    picker: {
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'black',
        color: 'black',
    },
});

export default SortByDropdown;
