@echo off
set "Ymd=%date:~,4%%date:~5,2%%date:~8,2%"
md "%cd%\%ymd%"
set bakFilePath=%cd%
cd..
cd..
cd %cd%\bin\mysql\mysql5.7.9\bin
set string=CREATE DATABASE Love_fund CHARACTER SET utf8 COLLATE utf8_general_ci;use Love_fund;
echo %string% > %bakFilePath%\%Ymd%\mysql.sql
"%cd%\mysqldump.exe" --opt -Q Love_fund -uroot -pmysql >> %bakFilePath%\%Ymd%\mysql.sql
pause