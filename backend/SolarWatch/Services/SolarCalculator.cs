using SolarWatch.Models;

namespace SolarWatch.Services;

using System;

public static class SolarCalculator
{
    private const double Rad = Math.PI / 180.0;
    private const double Deg = 180.0 / Math.PI;

    private static double ToRad(double deg) => deg * Rad;
    private static double ToDeg(double rad) => rad * Deg;

    private static double NormalizeDegrees(double deg)
    {
        deg %= 360.0;
        if (deg < 0) deg += 360.0;
        return deg;
    }

    public static SolarPositionResult GetSolarPosition(DateTime date, double latDeg, double lngDeg, double timezoneOffsetMinutes)
    {
        double julianDay = GetJulianDay(date);
        double T = (julianDay - 2451545.0) / 36525.0;

        // 🌍 Mean solar longitude
        double L0 = NormalizeDegrees(
            280.46646 + T * (36000.76983 + T * 0.0003032)
        );

        // 🌞 Mean anomaly
        double M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
        double Mrad = ToRad(M);

        // 🌍 Eccentricity
        double e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

        // 🌞 Equation of center
        double C =
            Math.Sin(Mrad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
            Math.Sin(2 * Mrad) * (0.019993 - 0.000101 * T) +
            Math.Sin(3 * Mrad) * 0.000289;

        // 🌞 True longitude
        double trueLong = L0 + C;

        // 🌞 Apparent longitude
        double omega = 125.04 - 1934.136 * T;
        double lambda = trueLong - 0.00569 - 0.00478 * Math.Sin(ToRad(omega));

        // 🌎 Obliquity
        double epsilon0 =
            23 +
            (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;

        double epsilon = epsilon0 + 0.00256 * Math.Cos(ToRad(omega));

        double epsilonRad = ToRad(epsilon);
        double lambdaRad = ToRad(lambda);

        // 🌌 Declination
        double declination = Math.Asin(
            Math.Sin(epsilonRad) * Math.Sin(lambdaRad)
        );

        // ⏱ Equation of time
        double y = Math.Tan(epsilonRad / 2.0) * Math.Tan(epsilonRad / 2.0);

        double eqTime =
            4 * ToDeg(
                y * Math.Sin(2 * ToRad(L0)) -
                2 * e * Math.Sin(Mrad) +
                4 * e * y * Math.Sin(Mrad) * Math.Cos(2 * ToRad(L0)) -
                0.5 * y * y * Math.Sin(4 * ToRad(L0)) -
                1.25 * e * e * Math.Sin(2 * Mrad)
            );

        // 🕒 True solar time
        double timeOffset = eqTime + 4 * lngDeg - timezoneOffsetMinutes;

        double trueSolarTime =
            (date.Hour * 60 +
             date.Minute +
             date.Second / 60.0 +
             timeOffset) % 1440;

        // 🌗 Hour angle
        double hourAngle =
            trueSolarTime / 4 < 0
                ? trueSolarTime / 4 + 180
                : trueSolarTime / 4 - 180;

        double hourAngleRad = ToRad(hourAngle);
        double latRad = ToRad(latDeg);

        // 🌞 Zenith
        double cosZenith =
            Math.Sin(latRad) * Math.Sin(declination) +
            Math.Cos(latRad) * Math.Cos(declination) * Math.Cos(hourAngleRad);

        double zenith = Math.Acos(cosZenith);

        // 🌞 Elevation
        double elevation = 90 - ToDeg(zenith);

        // 🧭 Azimuth
        double azimuth =
            ToDeg(
                Math.Atan2(
                    Math.Sin(hourAngleRad),
                    Math.Cos(hourAngleRad) * Math.Sin(latRad) -
                    Math.Tan(declination) * Math.Cos(latRad)
                )
            ) + 180;

        azimuth = NormalizeDegrees(azimuth);

        return new SolarPositionResult
        {
            Elevation = elevation,
            Azimuth = azimuth,
            Declination = ToDeg(declination),
            HourAngle = hourAngle,
            EquationOfTime = eqTime
        };
    }

    private static double GetJulianDay(DateTime date)
    {
        return date.ToUniversalTime().Subtract(
            new DateTime(1970, 1, 1)
        ).TotalDays + 2440587.5;
    }
}