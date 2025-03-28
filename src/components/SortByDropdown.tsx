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
    const [selectedOption, setSelectedOption] = useState<string>(preselected || "");
    const [options, setOptions] = useState<Auction[]>([]);

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
                        .sort((a: any, b: any) => a.fullAuctionDate.getTime() - b.fullAuctionDate.getTime())
                        .filter((auction: { statusText: string; }) => auction.statusText?.toLowerCase() !== "compeleted");

                    setOptions(sortedOptions);

                    // Ensure preselected value is updated if it exists
                    if (preselected) {
                        const auctionExists = sortedOptions.some((auction: { auctionTitle: string; }) => auction.auctionTitle === preselected);
                        setSelectedOption(auctionExists ? preselected : sortedOptions[0]?.auctionTitle || "");
                        onChange(auctionExists ? preselected : sortedOptions[0]?.auctionTitle || "");
                    } else if (sortedOptions.length > 0) {
                        setSelectedOption(sortedOptions[0].auctionTitle);
                        onChange(sortedOptions[0].auctionTitle);
                    }
                } else {
                    console.error("Failed to fetch auctions:", res_data.message);
                }
            } catch (error) {
                console.error("Error fetching auctions:", error);
            }
        };

        getAllAuctions();
    }, [backendURL]); // Removed dependencies like preselected to avoid unnecessary calls

    // Update selectedOption when preselected changes
    useEffect(() => {
        if (preselected) {
            const auctionExists = options.some(auction => auction.auctionTitle === preselected);
            setSelectedOption(auctionExists ? preselected : options[0]?.auctionTitle || "");
        }
    }, [preselected, options]);

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
