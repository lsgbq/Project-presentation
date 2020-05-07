@echo on
set "Ymd="20200507"
set bakFilePath=%cd%
cd..
cd..
cd %cd%\bin\mysql\mysql5.7.9\bin
"%cd%\mysql.exe" -uroot -pmysql< %bakFilePath%\%Ymd%\mysql.sql
pause