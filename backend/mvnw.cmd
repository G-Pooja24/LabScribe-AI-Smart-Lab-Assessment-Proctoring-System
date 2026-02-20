@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - custom repository for downloading maven
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for authenticated download
@REM   MVNW_VERBOSE - verbose log output
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "true" @ECHO ON
@setlocal

set "ERROR_CODE=0"

@REM To isolate internal variables from possible setting of command line or environment
set "WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPS=%~dp0.mvn\wrapper\maven-wrapper.properties"

@REM Get the distributionUrl from the properties file
for /f "tokens=2 delims==" %%i in ('findstr /i "distributionUrl" "%WRAPPER_PROPS%"') do set "DISTRIBUTION_URL=%%i"

@REM If we don't have a wrapper jar, try to download it
if not exist "%WRAPPER_JAR%" (
    if "%MVNW_VERBOSE%" == "true" echo Couldn't find %WRAPPER_JAR%, downloading it ...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_JAR%'"
)

@REM Execute the wrapper jar
java -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*

if ERRORLEVEL 1 set "ERROR_CODE=%ERROR_LEVEL%"

exit /B %ERROR_CODE%
