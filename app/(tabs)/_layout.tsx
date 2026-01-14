import Colors from "@/constants/colors";
import { Tabs } from "expo-router";
import { Bell, Home, Swords, Trophy, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textTertiary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: 76,
                    paddingBottom: 12,
                    paddingTop: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    paddingTop: 4
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: "Leaderboard",
                    tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="challenge"
                options={{
                    title: "Challenge",
                    tabBarIcon: ({ color, size }) => <Swords color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notifications",
                    tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
