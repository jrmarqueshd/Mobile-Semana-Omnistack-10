import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Image,
	View,
	Text,
	TextInput,
	TouchableOpacity
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import {
	requestPermissionsAsync,
	getCurrentPositionAsync
} from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

import API from "../services/api";

export default function Main({ navigation }) {
	const [users, setUsers] = useState(null);
	const [currentRegion, setCurrentRegion] = useState(null);
	const [techs, setTechs] = useState("");

	async function fetch() {
		const { latitude, longitude } = currentRegion;
		const response = await API.get("/search", {
			params: {
				latitude,
				longitude,
				techs: techs
			}
		});

		setUsers(response.data.devs);
	}

	fetch();

	function handleRegionChanged(region) {
		setCurrentRegion(region);
		console.log(currentRegion);
	}

	useEffect(() => {
		async function getCurrentPosition() {
			const { granted } = await requestPermissionsAsync();

			if (granted) {
				const { coords } = await getCurrentPositionAsync({
					enableHighAccuracy: true
				});

				const { latitude, longitude } = coords;
				setCurrentRegion({
					latitude,
					longitude,
					latitudeDelta: 0.1,
					longitudeDelta: 0.1
				});
			}
		}

		getCurrentPosition();
	}, []);

	if (!currentRegion) return null;

	return (
		<>
			<MapView
				onRegionChangeComplete={handleRegionChanged}
				initialRegion={currentRegion}
				style={styles.map}
			>
				{users.length > 0 &&
					users.map(user => (
						<Marker
							key={user._id}
							coordinate={{
								longitude: user.location.coordinate[1],
								latitude: user.location.coordinate[1]
							}}
						>
							<Image
								style={styles.avatar}
								source={{
									uri: user.avatar_url
								}}
							/>
							<Callout
								onPress={() => {
									navigation.navigate("Profile", {
										github_username: user.github_username
									});
								}}
							>
								<View style={styles.callout}>
									<Text style={styles.name}>{user.name}</Text>
									<Text style={styles.bio}>{user.bio}</Text>
									<Text style={styles.techs}>{user.tech.join(", ")}</Text>
								</View>
							</Callout>
						</Marker>
					))}
			</MapView>
			<View style={styles.searchForm}>
				<TextInput
					style={styles.searchInput}
					placeholder="Burcar devs por techs..."
					placeholderTextColor="#666"
					autoCapitalize="words"
					onChangeText={setTechs}
				/>
				<View>
					<TouchableOpacity style={styles.loadButton} onPress={() => {}}>
						<MaterialIcons name="my-location" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	map: {
		flex: 1
	},
	avatar: {
		width: 54,
		height: 54,
		borderRadius: 27,
		borderWidth: 2,
		borderColor: "#fff"
	},
	callout: {
		width: 260
	},
	name: {
		fontWeight: "bold",
		fontSize: 16
	},
	bio: {
		color: "#666",
		marginTop: 5
	},
	techs: {
		marginTop: 5
	},
	searchForm: {
		position: "absolute",
		top: 20,
		left: 20,
		right: 20,
		zIndex: 5,
		flexDirection: "row"
	},
	searchInput: {
		flex: 1,
		height: 50,
		backgroundColor: "#fff",
		color: "#333",
		borderRadius: 25,
		paddingHorizontal: 20,
		fontSize: 16,
		// Sombras no IOS
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowOffset: {
			width: 4,
			height: 4
		},
		// Sombras no Android
		elevation: 2
	},
	loadButton: {
		width: 50,
		height: 50,
		backgroundColor: "#7d40e7",
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 15
	}
});
