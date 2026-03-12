@echo off
echo ================================
echo 传奇世界自动化测试运行脚本
echo ================================
echo.

echo 检查Python环境...
python --version
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo.
echo 安装依赖...
pip install -r requirements.txt
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 安装Playwright浏览器...
playwright install
if errorlevel 1 (
    echo 错误: Playwright浏览器安装失败
    pause
    exit /b 1
)

echo.
echo ================================
echo 选择要运行的测试:
echo ================================
echo 1. 运行所有测试
echo 2. 运行冒烟测试
echo 3. 运行角色创建测试
echo 4. 运行战斗系统测试
echo 5. 运行装备系统测试
echo 6. 运行地图系统测试
echo 7. 运行技能系统测试
echo 8. 运行任务系统测试
echo 9. 运行存档系统测试
echo 0. 退出
echo ================================
echo.

set /p choice="请输入选项 (0-9): "

if "%choice%"=="1" goto all_tests
if "%choice%"=="2" goto smoke_tests
if "%choice%"=="3" goto character_tests
if "%choice%"=="4" goto battle_tests
if "%choice%"=="5" goto equipment_tests
if "%choice%"=="6" goto map_tests
if "%choice%"=="7" goto skill_tests
if "%choice%"=="8" goto quest_tests
if "%choice%"=="9" goto save_tests
if "%choice%"=="0" goto end

:all_tests
echo.
echo 运行所有测试...
pytest -v
goto end

:smoke_tests
echo.
echo 运行冒烟测试...
pytest -v -m smoke
goto end

:character_tests
echo.
echo 运行角色创建测试...
pytest -v -m character
goto end

:battle_tests
echo.
echo 运行战斗系统测试...
pytest -v -m battle
goto end

:equipment_tests
echo.
echo 运行装备系统测试...
pytest -v -m equipment
goto end

:map_tests
echo.
echo 运行地图系统测试...
pytest -v -m map
goto end

:skill_tests
echo.
echo 运行技能系统测试...
pytest -v -m skill
goto end

:quest_tests
echo.
echo 运行任务系统测试...
pytest -v -m quest
goto end

:save_tests
echo.
echo 运行存档系统测试...
pytest -v -m save
goto end

:end
echo.
echo 测试完成!
pause
