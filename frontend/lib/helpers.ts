import api from "@/app/api";
import { Exam } from "@/types/types";
import { headers } from "next/headers";

export function formatIndianNumber(number: number | null) {
	if (!number) {
		return;
	}
	let numStr = number.toString();
	let [integerPart, fractionalPart] = numStr.split(".");
	let lastThreeDigits = integerPart.slice(-3);
	let otherDigits = integerPart.slice(0, -3);
	if (otherDigits.length > 0) {
		otherDigits = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
		integerPart = otherDigits + "," + lastThreeDigits;
	} else {
		integerPart = lastThreeDigits;
	}
	return fractionalPart ? integerPart + "." + fractionalPart : integerPart;
}
export function convertDateToRequiredFormat(date: string) {
	const months: {
		[key: number]: string;
	} = {
		1: "Jan",
		2: "Feb",
		3: "Mar",
		4: "Apr",
		5: "May",
		6: "Jun",
		7: "Jul",
		8: "Aug",
		9: "Sep",
		0: "Oct",
		11: "Nov",
		12: "Dec",
	};
	const [year, month, day] = date.split("-");
	return `${day} ${months[parseInt(month)]} ${year}`;
}
export function objectToString(obj: any) {
	let result = "Error occurred: ";
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			const data = obj[key] as string;
			result += key + data.toString().toLowerCase().replace("this field", "");
			break;
		}
	}
	return result;
}
export function convertToDateAndTime(isoString: string) {
	// Convert the ISO string to a Date object
	let date = new Date(isoString);

	// Extract date and time parts
	let datePart = date.toLocaleDateString(); // Only the date part
	let timePart = date.toLocaleTimeString(); // Only the time part

	return { date: datePart, time: timePart };
}
export const fetcher = (...args: Parameters<typeof fetch>) =>
	fetch(...args).then((res) => res.json());
export const getFetcherApi = (
	url: string,
	access: string | undefined | unknown
) =>
	api
		.get(url, {
			headers: {
				Authorization: `Bearer ${access}`,
			},
		})
		.then((res) => res.data);
export function checkDateStatus(
	startDate: Date | string,
	endDate: Date | string
) {
	const currentDate = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (currentDate >= start && currentDate <= end) {
		return 0; // Current date is within the range
	} else if (currentDate < start) {
		return 1; // Current date is before the start date
	} else {
		return 2; // Current date is after the end date
	}
}
export function getExamStatus(
	exam: Exam,
	startDate: Date | string,
	endDate: Date | string
) {
	const status = checkDateStatus(startDate, endDate);
	return status === 0
		? exam.status === "open"
			? "Open"
			: "Closed"
		: status === 2
		? "Closed"
		: "Not open";
}
export function getExamStatusStyle(
	exam: Exam,
	startDate: Date | string,
	endDate: Date | string
) {
	const status = checkDateStatus(startDate, endDate);
	return status === 0
		? exam.status === "open"
			? "bg-green-100 text-green-800"
			: "bg-red-100 text-red-800"
		: status === 2
		? "bg-red-100 text-red-800"
		: "bg-blue-100 text-blue-800";
}
