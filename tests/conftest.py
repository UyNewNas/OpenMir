import pytest
from playwright.sync_api import Page, BrowserContext
import os
import time


GAME_URL = "http://localhost:8080/index.html"


@pytest.fixture(scope="function")
def game_page(page: Page):
    page.goto(GAME_URL)
    page.wait_for_load_state("networkidle")
    yield page
    try:
        page.evaluate("localStorage.clear()")
    except:
        pass


@pytest.fixture(scope="function")
def clean_game_page(page: Page):
    page.goto(GAME_URL)
    page.wait_for_load_state("networkidle")
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    yield page


@pytest.fixture(scope="function")
def started_game(game_page: Page):
    create_character(game_page, "TestPlayer", "warrior")
    yield game_page


def create_character(page: Page, name: str, character_class: str):
    name_input = page.locator("#playerNameInput")
    name_input.fill(name)
    
    class_card = page.locator(f".class-card[data-class='{character_class}']")
    class_card.click()
    
    start_btn = page.locator("#startBtn")
    start_btn.click()
    
    page.wait_for_selector("#gameContainer", state="visible", timeout=5000)
    page.wait_for_selector(".player-name", state="visible", timeout=5000)


def get_player_stats(page: Page) -> dict:
    return {
        "level": page.locator("#playerLevel").text_content(),
        "hp": page.locator("#playerHp").text_content(),
        "mp": page.locator("#playerMp").text_content(),
        "atk": page.locator("#playerAtk").text_content(),
        "def": page.locator("#playerDef").text_content(),
        "crit": page.locator("#playerCrit").text_content(),
    }


def get_resources(page: Page) -> dict:
    return {
        "gold": page.locator("#gold").text_content(),
        "diamond": page.locator("#diamond").text_content(),
        "forgeStone": page.locator("#forgeStone").text_content(),
        "refineStone": page.locator("#refineStone").text_content(),
        "skillBook": page.locator("#skillBook").text_content(),
        "rebirthPill": page.locator("#rebirthPill").text_content(),
    }


def switch_tab(page: Page, tab_name: str):
    tab_btn = page.locator(f".tab-btn[data-tab='{tab_name}']")
    tab_btn.click()
    page.wait_for_timeout(200)


def wait_for_battle(page: Page, duration_ms: int = 3000):
    page.wait_for_timeout(duration_ms)
