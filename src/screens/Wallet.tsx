import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import Toast from "react-native-toast-message";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;

interface Transaction {
  withdrawRequestDate: string | number | Date;
  inv: string;
  depositeDate: string | number | Date;
  id: string;
  amount: string;
  date: string;
  status: "approved" | "rejected" | "pending";
}



const getStatusStyle = (status: Transaction["status"]) => {
  switch (status) {
    case "approved":
      return { color: "#27AE60", bgColor: "#D4EFDF" };
    case "rejected":
      return { color: "#E74C3C", bgColor: "#FADBD8" };
    case "pending":
      return { color: "#F39C12", bgColor: "#FDEBD0" };
    default:
      return { color: "#000", bgColor: "#EEE" };
  }
};


const renderTransactionItem = ({ item }: { item: Transaction }) => {
  const statusStyle = getStatusStyle(item.status);
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionAmount}>{item.amount} AED</Text>
          <Text style={styles.transactionDate}>{new Date(item?.depositeDate || item?.withdrawRequestDate).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
          <Icon name="bank-transfer" size={25} color={statusStyle.color} />
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{item?.status?.charAt(0).toUpperCase() + item?.status?.slice(1) || "N/A"}</Text>
        </View>
      </View>
      {
        item.inv &&
        <TouchableOpacity
          style={styles.eye}
          onPress={() => Linking.openURL(`${item.inv}?attachment=true`)}
        >
          <Icon name="eye-outline" size={26} color="#010153" />
        </TouchableOpacity>
      }

    </View>
  );
};

const WalletHistoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<"withdraw" | "deposit">("deposit");
  const [balance, setBalance] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState<boolean>(true); // <-- add
  const [loading, setLoading] = useState<boolean>(false);
  const [withdrawHistory, setWithdrawHistory] = useState<Transaction[]>([]);
  const [depositHistory, setDepositHistory] = useState<Transaction[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchToken = async () => {
      setTokenLoading(true);
      const tokeninner = await getToken();
      setToken(tokeninner)
      setTokenLoading(false);
    }
    fetchToken()
  }, [])


  const getDeposits = useCallback(async () => {
    const authorizationToken = `Bearer ${token}`;
    try {
      setLoading(true);
      const response = await fetch(`${backendURL}/wallet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
      });
      const res_data = await response.json();
      if (response.ok) {
        const sortByDateDesc = (arr: Transaction[]) =>
          arr.sort((a, b) => new Date(b.depositeDate || b.withdrawRequestDate).getTime() - new Date(a.depositeDate || a.withdrawRequestDate).getTime());

        setWithdrawHistory(
          Array.isArray(res_data.withdrawHistory)
            ? sortByDateDesc(res_data.withdrawHistory)
            : []
        );
        setDepositHistory(
          Array.isArray(res_data.depositeHistory)
            ? sortByDateDesc(res_data.depositeHistory)
            : []
        );
        setBalance(res_data.currentAmount || 0);
      } else {
        console.error(res_data.message);
      }
    } catch (error) {
      console.error("Error in getting deposits:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);


  useFocusEffect(
    useCallback(() => {
      if (token) {
        getDeposits();
      }
    }, [token])
  );


  const handleWithdraw = () => {
    if (balance < 1) {
      Toast.show({
        type: "error",
        text1: t("not_enough_balance")
      });
      return
    } else if (!token || tokenLoading) {
      Toast.show({
        type: "error",
        text1: t("please_wait_loading_session") || "Please wait, still loading your session."
      });
      return;
    } else {
      navigation.navigate("Withdraw", { balance })
    }
  }

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>{t("current_balance")}</Text>
        <Text style={styles.balanceAmount}>{balance} AED</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (!token || tokenLoading) {
              Toast.show({ type: "error", text1: t("please_wait_loading_session") || "Please wait, still loading your session." });
              return;
            }
            navigation.navigate("Deposit");
          }}
          disabled={!token || tokenLoading}
        >
          <Icon name="cash-plus" size={20} color="#FFF" />
          <Text style={styles.buttonText}>{t("deposit")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw} disabled={!token || tokenLoading}>
          <Icon name="cash-minus" size={20} color="#FFF" />
          <Text
            disabled={!token || tokenLoading}
            style={styles.buttonText}>{t("withdraw")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "deposit" && styles.activeTab]}
          onPress={() => setSelectedTab("deposit")}
        >
          <Text style={[styles.tabText, selectedTab === "deposit" && styles.activeTabText]}>
            {t("deposit_history")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "withdraw" && styles.activeTab]}
          onPress={() => setSelectedTab("withdraw")}
        >
          <Text style={[styles.tabText, selectedTab === "withdraw" && styles.activeTabText]}>
            {t("withdraw_history")}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedTab === "withdraw" ? withdrawHistory : depositHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        style={{ marginBottom: 75 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  balanceContainer: {
    alignItems: "center",
    padding: 20,
    height: 100,
    backgroundColor: "#010153",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  balanceTitle: {
    fontSize: 18,
    color: "#FFF",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#010153",
    padding: 12,
    borderRadius: 8,
    width: "40%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tabContainer: {
    marginTop: 10,
    flexDirection: "row",
    backgroundColor: "#FFF",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  tabButton: {
    width: screenWidth / 2.3,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#010153",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
  activeTabText: {
    color: "#010153",
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 15,
    shadowColor: "gray",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  transactionContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  transactionDetails: {
    marginBottom: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 14,
    color: "#555",
  },
  statusBadge: {
    alignSelf: "stretch",
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 10
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default WalletHistoryScreen;
