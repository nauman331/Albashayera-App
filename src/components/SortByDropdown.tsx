import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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
    const [dropdownItems, setDropdownItems] = useState<{ label: string; value: string }[]>([]);
    const [open, setOpen] = useState<boolean>(false);

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
                        .filter((auction: { statusText: string; }) => auction.statusText?.toLowerCase() !== "compeleted");

                    const formattedOptions = sortedOptions.map((auction: { auctionTitle: any; }) => ({
                        label: auction.auctionTitle,
                        value: auction.auctionTitle,
                    }));

                    setDropdownItems(formattedOptions);

                    const defaultOption = preselected && formattedOptions.some((opt: { value: string; }) => opt.value === preselected)
                        ? preselected
                        : formattedOptions[0]?.value || "";

                    setSelectedOption(defaultOption);
                    onChange(defaultOption);
                } else {
                    console.error("Failed to fetch auctions:", res_data.message);
                }
            } catch (error) {
                console.error("Error fetching auctions:", error);
            }
        };

        getAllAuctions();
    }, [backendURL]);

    useEffect(() => {
        if (preselected && dropdownItems.length > 0) {
            const exists = dropdownItems.some(item => item.value === preselected);
            const newSelection = exists ? preselected : dropdownItems[0]?.value || "";
            setSelectedOption(newSelection);
        }
    }, [preselected, dropdownItems]);

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={selectedOption}
                items={dropdownItems}
                setOpen={setOpen}
                setValue={(callback) => {
                    const value = callback(selectedOption);
                    setSelectedOption(value);
                    onChange(value);
                }}
                setItems={setDropdownItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                zIndex={5000}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        zIndex: 5000, // required when used alongside other dropdowns
    },
    dropdown: {
        backgroundColor: "#fff",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 8,
        elevation: 2,
    },
    dropDownContainer: {
        backgroundColor: "#fff",
        borderColor: "black",
        zIndex: 5000,
    },
});

export default SortByDropdown;
