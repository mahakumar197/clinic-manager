import { widthPercentageToDP } from "@utils/helpers";
import { StyleSheet } from "react-native";
import { colors, fontfamily, sizes } from "../constant/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  menuContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fontfamily.medium,
    fontSize: sizes.size2,
    color: colors.black,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: widthPercentageToDP('20%'),
    paddingVertical: sizes.size1,
    alignItems: 'center',
    width: '60%',
    bottom: '5%',
    margin: '5%',
  },
  logoutText: {
    fontFamily: fontfamily.bold,
    fontSize: sizes.size3,
    color: colors.red,
  },
});
