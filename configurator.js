import {
	OBJECTS,
	ROOMS,
	SCENARIOS,
	CATEGORY_LABELS,
	buildDeck,
	scopeForScenario,
	compileEstimate,
	formatPrice
} from './configurator-data.js';

const STORAGE_KEY = 'domatch-configurator-v5';
const STEPS = ['Объект', 'Помещения', 'Ритм жизни', 'Сценарии', 'Смета'];
const PROFILE_QUESTIONS = [
	{
		field: 'household',
		kicker: 'Кто будет жить дома?',
		title: 'Кому дом будет помогать каждый день?',
		options: [
			['alone', 'Живу один', 'Один ритм — точные сценарии без лишнего'],
			['couple', 'Живём вдвоём', 'У каждого остаётся удобный способ управления'],
			['family', 'Семья с детьми', 'Мягкий ночной свет, воздух и безопасность'],
			['rare', 'Редкие заезды', 'Дом готовится к приезду и экономит в пустые дни']
		]
	},
	{
		field: 'usage',
		kicker: 'Как используется объект?',
		title: 'Дом, гости или аренда?',
		options: [
			['self', 'Для себя', 'Максимум личного комфорта каждый день'],
			['mixed', 'Для себя и гостей', 'Личный режим плюс временный доступ'],
			['rent', 'Для аренды', 'Гостевой цикл, тишина и доступ без ключей']
		]
	},
	{
		field: 'control',
		kicker: 'Как удобнее управлять?',
		title: 'Как вы хотите общаться с домом?',
		options: [
			['voice', 'Голосом', 'Короткие команды для света, климата и штор'],
			['panel', 'С панели', 'Постоянный понятный центр на стене'],
			['app', 'Из приложения', 'Все комнаты и уведомления в телефоне'],
			['minimal', 'Почти незаметно', 'Дом действует сам, интерфейсов минимум']
		]
	},
	{
		field: 'budget',
		kicker: 'Уровень системы',
		title: 'Насколько глубокой будет автоматизация?',
		options: [
			['essential', 'Необходимая основа', 'Безопасность и самые заметные сценарии'],
			['balanced', 'Комфортный баланс', 'Удобство во всех ключевых помещениях'],
			['premium', 'Максимум возможностей', 'Климат, воздух и расширенная автоматизация']
		]
	}
];
const PROFILE_PRESETS = {
	solo: { household: 'alone', usage: 'self', control: 'app', budget: 'essential', title: 'Живу один', note: 'Самое нужное, без лишней автоматики', image: './assets/configurator/object-studio.jpg' },
	couple: { household: 'couple', usage: 'self', control: 'voice', budget: 'balanced', title: 'Живём вдвоём', note: 'Комфортный баланс на каждый день', image: './assets/configurator/scenario-curtains.jpg' },
	family: { household: 'family', usage: 'self', control: 'voice', budget: 'balanced', title: 'Семья', note: 'Безопасность, воздух и спокойные ночи', image: './assets/configurator/scenario-welcome.jpg' },
	rental: { household: 'rare', usage: 'rent', control: 'app', budget: 'essential', title: 'Гости или аренда', note: 'Доступ, тишина и экономичный режим', image: './assets/configurator/scenario-access.jpg' }
};

const freshState = () => ({
	version: 5,
	step: 0,
	object: null,
	area: 68,
	buildStage: 'renovation',
	rooms: [],
	household: 'couple',
	usage: 'self',
	control: 'voice',
	budget: 'balanced',
	pets: false,
	plants: false,
	existingHub: false,
	existingWifi: false,
	decisions: {},
	scopes: {},
	deferred: [],
	history: []
});

function loadState() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
		if (saved?.version === 5) return { ...freshState(), ...saved, history: [] };
	} catch {}
	return freshState();
}

let state = loadState();
let detailsId = null;
let swipeLocked = false;
let lastFocused = null;
let modalReturnFocus = null;
let profileSlide = 0;
let profileMode = 'preset';
let roomMode = 'preset';
let stepDirection = 1;
let decisionToken = 0;
let areaSaveTimer = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const ui = document.getElementById('domatch-ui');
const root = document.documentElement;
const shell = document.getElementById('domatch-configurator');
const stage = document.getElementById('domatch-stage');
const entry = document.getElementById('domatch-entry');
const startButton = document.getElementById('domatch-start');
const progress = shell.querySelector('.dc-progress');
const live = document.getElementById('domatch-live');

function saveState() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, history: [] }));
	} catch {}
	updateLauncher();
}

function announce(message) {
	live.textContent = '';
	requestAnimationFrame(() => { live.textContent = message; });
}

function orderedRemaining() {
	const deck = buildDeck(state);
	const remaining = deck.filter((scenario) => !state.decisions[scenario.id]);
	const deferred = new Set(state.deferred || []);
	const postponed = (state.deferred || [])
		.map((id) => remaining.find((scenario) => scenario.id === id))
		.filter(Boolean);
	return [...remaining.filter((scenario) => !deferred.has(scenario.id)), ...postponed];
}

function scenarioDelta(scenario, draftState = state) {
	const before = compileEstimate(draftState).expected;
	const after = compileEstimate({
		...draftState,
		decisions: { ...draftState.decisions, [scenario.id]: 'yes' }
	}).expected;
	return Math.max(0, after - before);
}

function normalizeScenarioState() {
	const available = new Set(buildDeck(state).map((scenario) => scenario.id));
	for (const id of Object.keys(state.decisions)) {
		if (!available.has(id)) {
			delete state.decisions[id];
			delete state.scopes[id];
		}
	}
	for (const scenario of SCENARIOS) {
		if (!scenario.scalable) continue;
		const eligible = scopeForScenario(scenario, state);
		const savedScope = state.scopes[scenario.id];
		if (!available.has(scenario.id) || !eligible.length) {
			delete state.scopes[scenario.id];
			delete state.decisions[scenario.id];
			continue;
		}
		if (!savedScope?.length) continue;
		const validScope = savedScope.filter((room) => eligible.includes(room));
		if (!validScope.length) {
			delete state.scopes[scenario.id];
			delete state.decisions[scenario.id];
		} else state.scopes[scenario.id] = validScope;
	}
	state.deferred = (state.deferred || []).filter((id) => available.has(id) && !state.decisions[id]);
}

function updateLauncher() {
	const deck = state.object ? buildDeck(state) : [];
	const completed = deck.filter((item) => state.decisions[item.id]).length;
	const label = startButton.querySelector('span');
	if (state.step === 4 && completed) label.textContent = 'Открыть мою смету';
	else if (state.object) label.textContent = `Продолжить подбор · ${completed}/${deck.length}`;
	else label.textContent = 'Начать подбор';
	const meta = entry.querySelector('.domatch-entry__meta');
	meta.innerHTML = state.object
		? '<span>Выбор сохранён</span><span>Можно продолжить позже</span><span>Без регистрации</span>'
		: '<span>Без регистрации</span><span>Смета сразу</span><span>Выбор можно изменить</span>';
}

function updateProgress() {
	const deck = state.object ? buildDeck(state) : [];
	const allScenariosDecided = deck.length > 0 && deck.every((scenario) => ['yes', 'no'].includes(state.decisions[scenario.id]));
	progress.innerHTML = STEPS.map((label, index) => {
		const available = index <= state.step || (index === 4 && allScenariosDecided);
		return `<button type="button" data-jump="${index}" class="${index === state.step ? 'is-active' : ''}" ${available ? '' : 'disabled'}>${String(index + 1).padStart(2, '0')} · ${label}</button>`;
	}).join('');
}

function openConfigurator() {
	lastFocused = document.activeElement;
	shell.classList.add('is-open');
	shell.setAttribute('aria-hidden', 'false');
	root.classList.add('configurator-open');
	entry.setAttribute('aria-hidden', 'true');
	renderStep(false, true);
	announce(`Конфигуратор открыт. Шаг ${state.step + 1}: ${STEPS[state.step]}.`);
	setTimeout(() => stage.querySelector('button:not([disabled]), input')?.focus(), 420);
}

function closeConfigurator() {
	if (detailsId) {
		detailsId = null;
		renderModal();
		modalReturnFocus?.focus?.();
		return;
	}
	decisionToken += 1;
	swipeLocked = false;
	shell.classList.remove('is-open');
	shell.setAttribute('aria-hidden', 'true');
	root.classList.remove('configurator-open');
	entry.removeAttribute('aria-hidden');
	(lastFocused || startButton).focus?.();
}

function setStep(next, animate = true) {
	if (next < 0 || next > 4) return;
	if (state.step === 3 && next !== 3) {
		decisionToken += 1;
		swipeLocked = false;
	}
	const direction = next >= state.step ? 1 : -1;
	let committed = false;
	const commit = () => {
		if (committed) return;
		committed = true;
		if (next === 2 && state.step !== 2) {
			profileMode = 'preset';
			profileSlide = state.step > 2 ? PROFILE_QUESTIONS.length : 0;
		}
		if (next === 1 && state.step !== 1) roomMode = 'preset';
		stepDirection = direction;
		state.step = next;
		saveState();
		renderStep(animate, true);
		announce(`Шаг ${next + 1}: ${STEPS[next]}.`);
	};
	if (!animate || reduceMotion.matches || !stage.firstElementChild?.animate) return commit();
	stage.firstElementChild.animate([
		{ opacity: 1, transform: 'translate3d(0,0,0)' },
		{ opacity: 0, transform: `translate3d(${-direction * 14}px,0,0)` }
	], { duration: 130, easing: 'ease-in', fill: 'forwards' }).finished.then(commit, commit);
}

function renderStep(animate = true, resetScroll = false) {
	updateProgress();
	shell.classList.toggle('is-swipe', state.step === 3);
	shell.classList.toggle('is-profile', state.step === 2);
	shell.classList.toggle('is-estimate', state.step === 4);
	const renders = [renderObjectStep, renderRoomsStep, renderLifestyleStep, renderSwipeStep, renderEstimateStep];
	stage.innerHTML = renders[state.step]();
	if (resetScroll) stage.scrollTop = 0;
	renderModal();
	if (state.step === 3) bindSwipeCard();
	if (animate && !reduceMotion.matches && stage.firstElementChild?.animate) {
		stage.firstElementChild.animate([
			{ opacity: 0, transform: `translate3d(${stepDirection * 14}px,0,0)` },
			{ opacity: 1, transform: 'translate3d(0,0,0)' }
		], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
	}
	saveState();
}

function renderObjectStep() {
	const object = state.object ? OBJECTS[state.object] : null;
	const area = object ? Math.max(object.area.min, Math.min(object.area.max, state.area)) : state.area;
	const min = object?.area.min || 20;
	const max = object?.area.max || 240;
	const range = ((area - min) / (max - min)) * 100;
	return `
		<section class="dc-step dc-step--object ${object ? 'has-object' : ''}">
			<header class="dc-flow-heading">
				<div><span class="dc-kicker">01 · Объект</span><h2>Где будет <em>умный дом?</em></h2></div>
				<p>Выберите карточку — площадь и этап уточним рядом.</p>
			</header>
			<div class="dc-object-workspace">
				<div class="dc-object-grid">
					${Object.entries(OBJECTS).map(([id, item]) => `
						<button type="button" data-object="${id}" class="${state.object === id ? 'is-selected' : ''}" style="--object-image:url('${item.image}')" aria-pressed="${state.object === id}">
							<i>${state.object === id ? 'Ваш выбор' : item.note}</i>
							<span>${item.label}</span>
							<p>${item.story}</p>
							<small>${state.object === id ? 'Можно продолжать' : 'Выбрать'}</small>
						</button>`).join('')}
				</div>
				<aside class="dc-object-setup ${object ? 'is-visible' : ''}">
					${object ? `
						<div class="dc-setup-title"><span>Пара деталей</span><strong>${object.label}</strong></div>
						<div class="dc-area-card">
							<label class="dc-range-label"><span>Площадь</span><strong>${area} м²</strong></label>
							<input class="dc-range" data-area type="range" min="${min}" max="${max}" value="${area}" style="--range:${range}%" aria-label="Площадь объекта">
						</div>
						<div class="dc-field-title">Стадия объекта</div>
						<div class="dc-segmented">
							${option('buildStage', 'planning', 'Проект', 'Закладываем всё заранее')}
							${option('buildStage', 'renovation', 'Ремонт', 'Совмещаем с работами')}
							${option('buildStage', 'finished', 'Готово', 'Без лишних переделок')}
						</div>
						<button class="dc-next dc-next--wide" type="button" data-next>К помещениям <b>→</b></button>
					` : '<p>Сначала выберите один из трёх типов объекта.</p>'}
				</aside>
			</div>
		</section>`;
}

function renderRoomsStep() {
	const object = OBJECTS[state.object] || OBJECTS.apartment;
	const availableRooms = ROOMS.filter((room) => room.id !== 'stairs' || object.floors > 1);
	const defaults = [...object.rooms];
	const essentials = defaults.filter((id) => ['entry', 'living', 'bedroom', 'bath', 'stairs'].includes(id));
	if (roomMode === 'preset') {
		const presets = [
			{ id: 'all', title: 'Весь объект', note: 'Рекомендуем', text: `${defaults.length} помещений · полная автоматизация`, image: object.image },
			{ id: 'essential', title: 'Только главное', note: 'Легче начать', text: `${essentials.length} помещений · ключевой комфорт и безопасность`, image: './assets/configurator/scenario-welcome.jpg' }
		];
		return `
			<section class="dc-step dc-step--rooms dc-step--room-presets">
				<header class="dc-flow-heading">
					<div><span class="dc-kicker">02 · Помещения</span><h2>Какой охват <em>подходит?</em></h2></div>
					<p>Один выбор — и идём дальше. Точный список можно собрать вручную.</p>
				</header>
				<div class="dc-room-presets">
					${presets.map((preset) => `<button type="button" data-room-preset="${preset.id}" style="--preset-image:url('${preset.image}')">
						<i>${preset.note}</i><strong>${preset.title}</strong><p>${preset.text}</p><span>Выбрать и продолжить →</span>
					</button>`).join('')}
					<button type="button" class="dc-room-preset-manual" data-room-manual>
						<i>Точный выбор</i><strong>Настроить вручную</strong><p>Отметьте только те комнаты, которые нужны сейчас.</p><span>Открыть комнаты →</span>
					</button>
				</div>
				<button class="dc-back dc-flow-back" type="button" data-back>← Назад к объекту</button>
			</section>`;
	}
	return `
		<section class="dc-step dc-step--rooms dc-step--rooms-manual">
			<header class="dc-flow-heading">
				<div><span class="dc-kicker">02 · Ручной выбор</span><h2>Оставьте <em>нужные комнаты.</em></h2></div>
				<p>${state.rooms.length} ${plural(state.rooms.length, 'помещение', 'помещения', 'помещений')} в расчёте</p>
			</header>
			<div class="dc-room-grid dc-room-grid--manual">
				${availableRooms.map((room, index) => {
					const selected = state.rooms.includes(room.id);
					return `<button type="button" data-room="${room.id}" class="dc-room ${selected ? 'is-selected' : ''}" aria-pressed="${selected}">
						<img src="${room.image}" alt="${room.label}" loading="lazy"><span class="dc-room__shade"></span>
						<i>${String(index + 1).padStart(2, '0')} · ${selected ? 'Выбрано' : room.note}</i>
						<b>${room.label}</b>
						<small>${selected ? 'Нажмите, чтобы убрать' : 'Нажмите, чтобы добавить'}</small>
					</button>`;
				}).join('')}
			</div>
			<div class="dc-step-nav dc-step-nav--sticky">
				<button class="dc-back" type="button" data-room-presets-back>← Готовые наборы</button>
				<button class="dc-next" type="button" data-next ${state.rooms.length ? '' : 'disabled'}>Готово <b>→</b></button>
			</div>
		</section>`;
}

function renderLifestyleStep() {
	if (profileMode === 'preset') {
		return `
			<section class="dc-step dc-step--lifestyle dc-step--profile-presets">
				<header class="dc-flow-heading">
					<div><span class="dc-kicker">03 · Ритм жизни</span><h2>Какой профиль <em>ближе вам?</em></h2></div>
					<p>Одна карточка настроит рекомендации. Если хочется точнее — ответьте на четыре коротких вопроса.</p>
				</header>
				<div class="dc-profile-presets">
					${Object.entries(PROFILE_PRESETS).map(([id, preset]) => `
						<button type="button" data-profile-preset="${id}" style="--profile-image:url('${preset.image}')">
							<i>${id === 'couple' ? 'Популярный выбор' : 'Готовый профиль'}</i>
							<strong>${preset.title}</strong><p>${preset.note}</p><span>Выбрать и продолжить →</span>
						</button>`).join('')}
				</div>
				<div class="dc-profile-foot">
					<button class="dc-back" type="button" data-back>← К помещениям</button>
					<button type="button" data-profile-details>Настроить точнее · 4 вопроса →</button>
				</div>
			</section>`;
	}

	const extrasSlide = profileSlide >= PROFILE_QUESTIONS.length;
	const current = PROFILE_QUESTIONS[Math.min(profileSlide, PROFILE_QUESTIONS.length - 1)];
	const completed = Math.min(profileSlide, PROFILE_QUESTIONS.length);
	return `
		<section class="dc-step dc-step--lifestyle dc-step--profile-flow">
			<header class="dc-flow-heading dc-flow-heading--profile">
				<div><span class="dc-kicker">03 · Точный профиль</span><h2>${extrasSlide ? 'Последние <em>детали.</em>' : current.title}</h2></div>
				<p>${extrasSlide ? 'Необязательные признаки помогают точнее подобрать датчики и инфраструктуру.' : 'Выберите одну карточку — следующий вопрос откроется сам.'}</p>
			</header>
			<div class="dc-profile-progress" aria-label="Прогресс профиля"><span style="width:${((completed + (extrasSlide ? 1 : 0)) / (PROFILE_QUESTIONS.length + 1)) * 100}%"></span><small>${extrasSlide ? 'Дополнительно' : `${profileSlide + 1} из ${PROFILE_QUESTIONS.length}`}</small></div>
			<div class="dc-profile-flow">
				${extrasSlide ? `
					<div class="dc-question dc-question--extras">
						<div class="dc-question__title"><span>Что ещё учитывать?</span><small>Можно выбрать несколько или сразу продолжить</small></div>
						<div class="dc-toggle-grid">
							${toggle('pets', 'Есть питомец', 'Камера и кормление')}
							${toggle('plants', 'Есть растения', 'Свет, почва и полив')}
							${toggle('existingHub', 'Хаб уже есть', 'Не добавлять базовый хаб')}
							${toggle('existingWifi', 'Wi‑Fi уже стабилен', 'Не добавлять mesh-сеть')}
						</div>
					</div>
				` : `
					<div class="dc-question dc-question--single">
						<div class="dc-question__title"><span>${current.kicker}</span><small>Одна карточка</small></div>
						<div class="dc-choice-grid dc-choice-grid--single">${current.options.map(([value, label, note]) => option(current.field, value, label, note)).join('')}</div>
					</div>
				`}
			</div>
			<div class="dc-profile-foot dc-profile-foot--flow">
				<button class="dc-back" type="button" data-profile-prev>${profileSlide ? '← Предыдущий вопрос' : '← Готовые профили'}</button>
				${extrasSlide ? '<button class="dc-next" type="button" data-profile-done>К сценариям <b>→</b></button>' : '<button type="button" data-profile-presets>Выбрать готовый профиль</button>'}
			</div>
		</section>`;
}

function renderSwipeStep() {
	const deck = buildDeck(state);
	const remaining = orderedRemaining();
	const completed = deck.length - remaining.length;
	const estimate = compileEstimate(state);
	if (!remaining.length) {
		return `<section class="dc-step dc-deck-done">
			<span class="dc-kicker">Выбор уже завершён</span>
			<h2>Смета <em>готова.</em></h2>
			<p>${estimate.accepted.length} ${plural(estimate.accepted.length, 'сценарий', 'сценария', 'сценариев')} · ${formatPrice(estimate.expected)}</p>
			<div class="dc-deck-done__actions"><button class="dc-back" type="button" data-back>← К профилю</button><button class="dc-next" type="button" data-estimate>Открыть смету <b>→</b></button></div>
		</section>`;
	}

	const cards = remaining.slice(0, 3);
	return `
		<section class="dc-step dc-step--swipe">
			<div class="dc-swipe-copy">
				<span class="dc-kicker">Шаг 04 / 05 · ${completed + 1} из ${deck.length}</span>
				<h2>Оставляйте<br><em>то, что нужно.</em></h2>
				<p>Вправо — добавить. Влево — пропустить. Жесты всегда дублируются кнопками.</p>
				<div class="dc-gesture-legend"><span>← Не нужно</span><span>Нужно →</span></div>
				<div class="dc-running-total"><span>Сейчас в смете</span><strong>${formatPrice(estimate.expected)}</strong><small>${estimate.accepted.length} ${plural(estimate.accepted.length, 'сценарий', 'сценария', 'сценариев')}</small></div>
			</div>
			<div class="dc-deck-wrap">
				<div class="dc-deck-progress"><span style="width:${((completed + 1) / deck.length) * 100}%"></span></div>
				<div class="dc-card-stack">
					${cards.reverse().map((scenario, reverseIndex) => {
						const position = cards.length - 1 - reverseIndex;
						return renderScenarioCard(scenario, position, position === 0);
					}).join('')}
				</div>
				<div class="dc-swipe-actions">
					<button type="button" data-decision="no" class="dc-swipe-action dc-swipe-action--no" aria-label="Не нужно"><span>×</span><small>Не нужно</small></button>
					<button type="button" data-decision="yes" class="dc-swipe-action dc-swipe-action--yes" aria-label="Нужно"><span>♥</span><small>Добавить</small></button>
				</div>
				<div class="dc-swipe-secondary">
					${remaining.length > 1 ? '<button type="button" data-decision="later">Решить позже</button>' : ''}
					<button type="button" data-undo ${state.history.length ? '' : 'disabled'}>↶ Отменить выбор</button>
				</div>
			</div>
		</section>`;
}

function renderScenarioCard(scenario, position, front) {
	return `<article class="dc-card ${front ? 'is-front' : ''}" data-card="${scenario.id}" style="--card-position:${position}" aria-label="${scenario.title}">
		<div class="dc-card__media"><img src="${scenario.image}" alt="${scenario.title}" draggable="false"><div class="dc-card__shade"></div></div>
		<div class="dc-card__stamp dc-card__stamp--yes">НУЖНО</div><div class="dc-card__stamp dc-card__stamp--no">ПРОПУСТИТЬ</div>
		<div class="dc-card__top"><span>${scenario.category}</span><button type="button" data-details="${scenario.id}" aria-label="Подробнее о сценарии">i</button></div>
		<div class="dc-card__body">
			<div class="dc-card__reason"><span>Почему вам</span><p>${scenario.reason(state)}</p></div>
			<h3>${scenario.title}</h3>
			<p class="dc-card__description">${scenario.text}</p>
			<div class="dc-card__equipment"><span>Состав решения</span><div>${scenario.equipment.split(' · ').map((item) => `<i>${item}</i>`).join('')}</div></div>
			<div class="dc-card__meta"><span>Изменит текущую смету</span><strong>+ ${formatPrice(scenarioDelta(scenario))}</strong></div>
		</div>
	</article>`;
}

function renderEstimateStep() {
	const estimate = compileEstimate(state);
	const object = OBJECTS[state.object];
	const compactViewport = window.matchMedia('(max-width: 760px)').matches;
	const postponed = estimate.deck.filter((scenario) => state.decisions[scenario.id] === 'no').slice(0, 4);
	const categoryGroups = Object.entries(CATEGORY_LABELS)
		.map(([category, label]) => ({ category, label, lines: estimate.lines.filter((line) => line.category === category) }))
		.filter((group) => group.lines.length);
	return `
		<section class="dc-step dc-step--estimate">
			<div class="dc-estimate-hero">
				<div class="dc-estimate-hero__copy"><span class="dc-kicker">Шаг 05 / 05 · Предварительная смета</span>
					<h2>${estimate.accepted.length ? `Дом совпал с вами<br><em>на ${estimate.match}%.</em>` : 'Смета начнётся<br><em>с первого совпадения.</em>'}</h2>
					<p>${object?.label || 'Объект'} · ${state.area} м² · ${state.rooms.length} помещений · ${estimate.accepted.length} сценариев</p>
				</div>
				<div class="dc-estimate-total"><span>Ориентировочная стоимость</span><strong data-count="${estimate.expected}">${formatPrice(estimate.expected)}</strong><small>Предварительный диапазон<br>${formatPrice(estimate.range.from)} — ${formatPrice(estimate.range.to)}</small></div>
			</div>
			${estimate.lines.length ? `
			<div class="dc-estimate-layout">
				<div class="dc-estimate-main">
					<div class="dc-estimate-summary">
						<div><strong>${estimate.deviceCount}</strong><span>устройств и работ</span></div>
						<div><strong>${estimate.accepted.length}</strong><span>выбранных сценариев</span></div>
						<div><strong>${state.rooms.length}</strong><span>умных помещений</span></div>
					</div>
					${categoryGroups.map(({ label, lines }, groupIndex) => {
						return `<details class="dc-estimate-group" ${groupIndex === 0 && !compactViewport ? 'open' : ''}>
							<summary><span><small>Раздел сметы</small><h3>${label}</h3></span><strong>${formatPrice(lines.reduce((sum, line) => sum + line.total, 0))}</strong><i aria-hidden="true">⌄</i></summary>
							<div class="dc-estimate-lines">${lines.map((line) => `<div class="dc-estimate-line"><div><b>${line.title}</b><small>${line.automatic ? 'Добавлено автоматически · ' : ''}${line.origins.slice(0, 2).join(' · ')}</small></div><span>${line.qty} × ${formatPrice(line.unitPrice)}</span><strong>${formatPrice(line.total)}</strong></div>`).join('')}</div>
						</details>`;
					}).join('')}
					${estimate.reserve ? `<div class="dc-reserve"><span>Резерв сложности объекта</span><strong>+ ${formatPrice(estimate.reserve)}</strong><small>Зависит от стадии ремонта и количества уровней</small></div>` : ''}
				</div>
				<aside class="dc-estimate-aside">
					<h3>Ваши совпадения</h3>
					<div class="dc-match-list">${estimate.accepted.map((scenario) => `<button type="button" data-edit-scenario="${scenario.id}"><img src="${scenario.image}" alt=""><span>${scenario.title}<small>Открыть карточку и изменить</small></span><b>В смете</b></button>`).join('')}</div>
					<div class="dc-assumptions"><h4>Что учтено</h4>${estimate.assumptions.map((item) => `<p>${item}</p>`).join('')}</div>
				</aside>
			</div>` : `
			<div class="dc-empty-estimate"><h3>Вы пока не добавили ни одного сценария</h3><p>Можно вернуться к карточкам или добавить минимальный набор безопасности: защита от протечек и контроль входа.</p><button class="dc-next" type="button" data-safety>Добавить безопасный старт</button></div>`}
			${postponed.length ? `<section class="dc-later-list"><span>Вы пропустили — можно вернуть</span><div>${postponed.map((scenario) => `<button type="button" data-edit-scenario="${scenario.id}"><img src="${scenario.image}" alt=""><b>${scenario.title}</b><small>Открыть</small></button>`).join('')}</div></section>` : ''}
			<div class="dc-final-actions">
				<button type="button" class="dc-back" data-jump="2">← Изменить профиль</button>
				<div><button type="button" data-copy>Скопировать</button><button type="button" data-download>Скачать смету</button><button type="button" class="dc-next" data-print>Распечатать / PDF <b>↗</b></button></div>
			</div>
			<div class="dc-estimate-footnote">Это предварительный расчёт. Совместимость, кабельные линии и точная стоимость уточняются после плана или обследования объекта. <button type="button" data-reset>Начать заново</button></div>
		</section>`;
}

function renderModal() {
	shell.querySelectorAll('.dc-modal').forEach((modal) => modal.remove());
	const modalOpen = Boolean(detailsId);
	stage.inert = modalOpen;
	shell.querySelector('.dc-header').inert = modalOpen;
	if (detailsId) {
		const scenario = SCENARIOS.find((item) => item.id === detailsId);
		if (!scenario) return;
		shell.insertAdjacentHTML('beforeend', `<div class="dc-modal dc-modal--detail" role="dialog" aria-modal="true" aria-label="Подробнее о сценарии">
			<button class="dc-modal__backdrop" type="button" data-modal-close aria-label="Закрыть"></button>
			<article><button class="dc-modal__close" type="button" data-modal-close aria-label="Закрыть">×</button><img src="${scenario.image}" alt="${scenario.title}">
				<div><span>${scenario.category}</span><h2>${scenario.title}</h2><p>${scenario.text}</p><dl><dt>Что понадобится</dt><dd>${scenario.equipment}</dd><dt>Изменит текущую смету</dt><dd>+ ${formatPrice(scenarioDelta(scenario))}</dd><dt>Почему рекомендуем</dt><dd>${scenario.reason(state)}</dd></dl>
					<footer><button type="button" data-modal-decision="no">Не нужно</button><button class="dc-next" type="button" data-modal-decision="yes">Добавить сценарий <b>♥</b></button></footer>
				</div></article></div>`);
	}
}

function option(field, value, label, note = '') {
	return `<button type="button" data-field="${field}" data-value="${value}" class="${state[field] === value ? 'is-selected' : ''}" aria-pressed="${state[field] === value}"><span>${label}</span>${note ? `<small>${note}</small>` : ''}<i>${state[field] === value ? 'Выбрано' : 'Выбрать карточку'}</i></button>`;
}

function toggle(field, label, note) {
	return `<button type="button" data-toggle="${field}" class="${state[field] ? 'is-selected' : ''}" aria-pressed="${state[field]}"><span>${label}<small>${note}</small></span><b>${state[field] ? 'Учитываем' : 'Не выбрано'}</b></button>`;
}

function plural(number, one, few, many) {
	const mod10 = number % 10;
	const mod100 = number % 100;
	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
	return many;
}

function chooseObject(id) {
	const next = OBJECTS[id];
	if (!next) return;
	const changed = state.object !== id;
	state.object = id;
	if (changed) {
		state.area = next.area.value;
		state.rooms = [...next.rooms];
		state.decisions = {};
		state.scopes = {};
		state.deferred = [];
		state.history = [];
	}
	renderStep(false);
}

function chooseRoomPreset(id) {
	const object = OBJECTS[state.object] || OBJECTS.apartment;
	const recommended = [...object.rooms];
	const essential = recommended.filter((roomId) => ['entry', 'living', 'bedroom', 'bath', 'stairs'].includes(roomId));
	state.rooms = id === 'essential' ? (essential.length ? essential : recommended.slice(0, 1)) : recommended;
	normalizeScenarioState();
	setStep(2);
}

function chooseProfilePreset(id) {
	const preset = PROFILE_PRESETS[id];
	if (!preset) return;
	state.household = preset.household;
	state.usage = preset.usage;
	state.control = preset.control;
	state.budget = preset.budget;
	normalizeScenarioState();
	setStep(3);
}

function transitionProfile(update, direction = 1) {
	const panel = stage.querySelector('.dc-profile-flow');
	let committed = false;
	const commit = () => {
		if (committed) return;
		committed = true;
		update();
		renderStep(false);
		const nextPanel = stage.querySelector('.dc-profile-flow');
		if (!reduceMotion.matches && nextPanel?.animate) {
			nextPanel.animate([
				{ opacity: 0, transform: `translate3d(${direction * 10}px,0,0)` },
				{ opacity: 1, transform: 'translate3d(0,0,0)' }
			], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
		}
	};
	if (reduceMotion.matches || !panel?.animate) return commit();
	panel.animate([
		{ opacity: 1, transform: 'translate3d(0,0,0)' },
		{ opacity: 0, transform: `translate3d(${-direction * 8}px,0,0)` }
	], { duration: 100, easing: 'ease-in', fill: 'forwards' }).finished.then(commit, commit);
}

function goNext() {
	if (state.step === 0 && !state.object) return announce('Сначала выберите тип объекта.');
	if (state.step === 1 && !state.rooms.length) return announce('Выберите хотя бы одно помещение.');
	if (state.step === 3) return setStep(4);
	setStep(Math.min(4, state.step + 1));
}

function currentScenario() {
	return orderedRemaining()[0];
}

function deferScenario(scenario) {
	state.history.push({ type: 'defer', deferred: [...(state.deferred || [])] });
	state.history = state.history.slice(-20);
	state.deferred = [...(state.deferred || []).filter((id) => id !== scenario.id), scenario.id];
	saveState();
	renderStep(false);
	announce(`Сценарий «${scenario.title}» перемещён в конец колоды.`);
}

function animateDecision(decision) {
	if (swipeLocked) return;
	const scenario = currentScenario();
	const card = stage.querySelector('.dc-card.is-front');
	if (!scenario || !card) return;
	swipeLocked = true;
	const token = ++decisionToken;
	const direction = decision === 'yes' ? 1 : -1;
	const scope = decision === 'yes' && scenario.scalable ? scopeForScenario(scenario, state) : undefined;
	if (reduceMotion.matches) {
		swipeLocked = false;
		commitDecision(scenario, decision, scope);
		return;
	}
	card.classList.add(decision === 'yes' ? 'is-liked' : 'is-skipped');
	const finish = () => {
		if (token !== decisionToken) return;
		swipeLocked = false;
		commitDecision(scenario, decision, scope);
	};
	card.animate([
		{ transform: card.style.transform || 'translate3d(0,0,0) rotate(0)' },
		{ transform: `translate3d(${direction * 125}vw,-3vh,0) rotate(${direction * 12}deg)`, opacity: .4 }
	], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished.then(finish, finish);
}

function commitDecision(scenario, decision, scope) {
	state.history.push({ type: 'decision', id: scenario.id, decision: state.decisions[scenario.id] || null, scope: state.scopes[scenario.id] || null, deferred: [...(state.deferred || [])] });
	state.history = state.history.slice(-20);
	state.decisions[scenario.id] = decision;
	state.deferred = (state.deferred || []).filter((id) => id !== scenario.id);
	if (scope?.length) state.scopes[scenario.id] = [...scope];
	else delete state.scopes[scenario.id];
	if (navigator.vibrate && decision === 'yes') navigator.vibrate(12);
	const estimate = compileEstimate(state);
	announce(`${decision === 'yes' ? 'Добавлен' : decision === 'later' ? 'Отложен' : 'Пропущен'} сценарий «${scenario.title}». Смета ${formatPrice(estimate.expected)}.`);
	detailsId = null;
	saveState();
	if (!orderedRemaining().length) setStep(4);
	else renderStep(false);
}

function undoDecision() {
	const previous = state.history.pop();
	if (!previous) return;
	if (previous.type === 'defer') {
		state.deferred = previous.deferred || [];
		saveState();
		renderStep(false);
		announce('Карточка возвращена на прежнее место.');
		return;
	}
	if (previous.decision) state.decisions[previous.id] = previous.decision;
	else delete state.decisions[previous.id];
	if (previous.scope) state.scopes[previous.id] = previous.scope;
	else delete state.scopes[previous.id];
	state.deferred = previous.deferred || [];
	saveState();
	renderStep(false);
	announce('Последний выбор отменён.');
}

function bindSwipeCard() {
	const card = stage.querySelector('.dc-card.is-front');
	if (!card) return;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let startedAt = 0;
	let dragging = false;

	card.addEventListener('pointerdown', (event) => {
		if (event.target.closest('button') || swipeLocked) return;
		dragging = true;
		startX = lastX = event.clientX;
		startY = event.clientY;
		startedAt = performance.now();
		card.setPointerCapture(event.pointerId);
		card.classList.add('is-dragging');
	});
	card.addEventListener('pointermove', (event) => {
		if (!dragging) return;
		event.preventDefault();
		lastX = event.clientX;
		const dx = event.clientX - startX;
		const dy = (event.clientY - startY) * .12;
		const progress = Math.max(-1, Math.min(1, dx / (card.offsetWidth * .32)));
		card.style.transform = `translate3d(${dx}px,${dy}px,0) rotate(${progress * 4}deg)`;
		card.style.setProperty('--swipe-yes', Math.max(0, progress));
		card.style.setProperty('--swipe-no', Math.max(0, -progress));
	});
	const finish = (event) => {
		if (!dragging) return;
		dragging = false;
		card.classList.remove('is-dragging');
		const dx = lastX - startX;
		const velocity = Math.abs(dx) / Math.max(1, performance.now() - startedAt);
		if (Math.abs(dx) > card.offsetWidth * .25 || velocity > .65) animateDecision(dx > 0 ? 'yes' : 'no');
		else {
			card.style.transition = 'transform .45s cubic-bezier(.2,.9,.2,1)';
			card.style.transform = '';
			card.style.setProperty('--swipe-yes', 0);
			card.style.setProperty('--swipe-no', 0);
			setTimeout(() => { card.style.transition = ''; }, 460);
		}
		try { card.releasePointerCapture(event.pointerId); } catch {}
	};
	card.addEventListener('pointerup', finish);
	card.addEventListener('pointercancel', (event) => {
		if (!dragging) return;
		dragging = false;
		card.classList.remove('is-dragging');
		card.style.transition = 'transform .24s cubic-bezier(.2,.9,.2,1)';
		card.style.transform = '';
		card.style.setProperty('--swipe-yes', 0);
		card.style.setProperty('--swipe-no', 0);
		setTimeout(() => { card.style.transition = ''; }, 250);
		try { card.releasePointerCapture(event.pointerId); } catch {}
	});
}

function openDetails(id) {
	modalReturnFocus = document.activeElement;
	detailsId = id;
	renderModal();
	shell.querySelector('.dc-modal__close')?.focus();
}

function editScenario(id) {
	delete state.decisions[id];
	delete state.scopes[id];
	setStep(3);
}

function downloadEstimate() {
	const estimate = compileEstimate(state);
	const rows = [
		['DOMATCH — предварительная смета'],
		['Дата', new Date().toLocaleDateString('ru-RU')],
		['Объект', OBJECTS[state.object]?.label || ''],
		['Площадь', `${state.area} м²`],
		['Диапазон', `${formatPrice(estimate.range.from)} — ${formatPrice(estimate.range.to)}`],
		[],
		['Позиция', 'Количество', 'Цена за единицу', 'Итого', 'Основание'],
		...estimate.lines.map((line) => [line.title, line.qty, line.unitPrice, line.total, line.origins.join(', ')])
	];
	const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
	const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = `domatch-estimate-${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();
	URL.revokeObjectURL(url);
	announce('Смета скачана в формате CSV.');
}

async function copyEstimate() {
	const estimate = compileEstimate(state);
	const text = `DOMATCH — предварительная смета\n${OBJECTS[state.object]?.label}, ${state.area} м²\n${estimate.accepted.map((item) => `• ${item.title}`).join('\n')}\nОриентир: ${formatPrice(estimate.expected)}\nДиапазон: ${formatPrice(estimate.range.from)} — ${formatPrice(estimate.range.to)}`;
	try {
		await navigator.clipboard.writeText(text);
		announce('Краткая смета скопирована.');
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		document.body.append(area);
		area.select();
		document.execCommand('copy');
		area.remove();
		announce('Краткая смета скопирована.');
	}
}

function resetConfigurator() {
	if (!window.confirm('Начать подбор заново? Текущий выбор будет удалён на этом устройстве.')) return;
	state = freshState();
	detailsId = null;
	profileMode = 'preset';
	profileSlide = 0;
	roomMode = 'preset';
	localStorage.removeItem(STORAGE_KEY);
	renderStep(false, true);
	announce('Подбор начат заново.');
}

function handleClick(event) {
	const target = event.target.closest('button, [data-action], a[data-jump], a.dc-brand, a.domatch-entry__brand');
	if (!target) return;
	if (target.matches('.domatch-entry__brand')) { event.preventDefault(); return; }
	if (target.id === 'domatch-start') return openConfigurator();
	if (target.id === 'domatch-close') return closeConfigurator();
	if (target.matches('.dc-brand')) { event.preventDefault(); return setStep(0); }
	if (target.dataset.object) return chooseObject(target.dataset.object);
	if (target.dataset.roomPreset) return chooseRoomPreset(target.dataset.roomPreset);
	if (target.hasAttribute('data-room-manual')) {
		roomMode = 'manual';
		return renderStep(false, true);
	}
	if (target.hasAttribute('data-room-presets-back')) {
		roomMode = 'preset';
		return renderStep(false, true);
	}
	if (target.dataset.room) {
		const roomId = target.dataset.room;
		state.rooms = state.rooms.includes(roomId) ? state.rooms.filter((id) => id !== roomId) : [...state.rooms, roomId];
		normalizeScenarioState();
		const selected = state.rooms.includes(roomId);
		target.classList.toggle('is-selected', selected);
		target.setAttribute('aria-pressed', String(selected));
		const status = target.querySelector('i');
		if (status) status.textContent = status.textContent.replace(/·.+$/, `· ${selected ? 'Выбрано' : ROOMS.find((room) => room.id === roomId)?.note || 'Не выбрано'}`);
		const hint = target.querySelector('small');
		if (hint) hint.textContent = selected ? 'Нажмите, чтобы убрать' : 'Нажмите, чтобы добавить';
		const roomCount = stage.querySelector('.dc-flow-heading > p');
		if (roomCount) roomCount.textContent = `${state.rooms.length} ${plural(state.rooms.length, 'помещение', 'помещения', 'помещений')} в расчёте`;
		const nextButton = stage.querySelector('[data-next]');
		if (nextButton) nextButton.disabled = !state.rooms.length;
		saveState();
		return;
	}
	if (target.dataset.profilePreset) return chooseProfilePreset(target.dataset.profilePreset);
	if (target.hasAttribute('data-profile-details')) {
		profileMode = 'detail';
		profileSlide = 0;
		return renderStep(false, true);
	}
	if (target.hasAttribute('data-profile-presets')) {
		profileMode = 'preset';
		return renderStep(false, true);
	}
	if (target.hasAttribute('data-profile-prev')) {
		if (!profileSlide) {
			profileMode = 'preset';
			return renderStep(false, true);
		}
		return transitionProfile(() => { profileSlide -= 1; }, -1);
	}
	if (target.hasAttribute('data-profile-done')) return setStep(3);
	if (target.dataset.field) {
		const field = target.dataset.field;
		const value = target.dataset.value;
		if (state.step === 2 && profileMode === 'detail' && profileSlide < PROFILE_QUESTIONS.length && PROFILE_QUESTIONS[profileSlide].field === field) {
			return transitionProfile(() => {
				state[field] = value;
				profileSlide += 1;
				normalizeScenarioState();
			}, 1);
		}
		state[field] = value;
		normalizeScenarioState();
		stage.querySelectorAll(`[data-field="${field}"]`).forEach((button) => {
			const selected = button.dataset.value === value;
			button.classList.toggle('is-selected', selected);
			button.setAttribute('aria-pressed', String(selected));
			const status = button.querySelector('i');
			if (status) status.textContent = selected ? 'Выбрано' : 'Выбрать карточку';
		});
		saveState();
		return;
	}
	if (target.dataset.toggle) {
		const field = target.dataset.toggle;
		state[field] = !state[field];
		normalizeScenarioState();
		target.classList.toggle('is-selected', state[field]);
		target.setAttribute('aria-pressed', String(state[field]));
		const status = target.querySelector('b');
		if (status) status.textContent = state[field] ? 'Учитываем' : 'Не выбрано';
		saveState();
		return;
	}
	if (target.hasAttribute('data-next')) return goNext();
	if (target.hasAttribute('data-back')) return setStep(Math.max(0, state.step - 1));
	if (target.dataset.jump !== undefined) return setStep(Number(target.dataset.jump));
	if (target.dataset.decision) {
		if (target.dataset.decision === 'later') {
			const scenario = currentScenario();
			if (scenario) deferScenario(scenario);
		} else animateDecision(target.dataset.decision);
		return;
	}
	if (target.dataset.details) return openDetails(target.dataset.details);
	if (target.hasAttribute('data-modal-close')) {
		detailsId = null;
		renderModal();
		modalReturnFocus?.focus?.();
		return;
	}
	if (target.dataset.modalDecision) {
		const decision = target.dataset.modalDecision;
		detailsId = null;
		renderModal();
		return animateDecision(decision);
	}
	if (target.hasAttribute('data-undo')) return undoDecision();
	if (target.hasAttribute('data-estimate')) return setStep(4);
	if (target.dataset.editScenario) return editScenario(target.dataset.editScenario);
	if (target.hasAttribute('data-safety')) {
		state.decisions.leaks = 'yes';
		state.decisions.access = 'yes';
		return renderStep(false);
	}
	if (target.hasAttribute('data-download')) return downloadEstimate();
	if (target.hasAttribute('data-copy')) return copyEstimate();
	if (target.hasAttribute('data-print')) return window.print();
	if (target.hasAttribute('data-reset')) return resetConfigurator();
}

function handleInput(event) {
	if (!event.target.matches('[data-area]')) return;
	state.area = Number(event.target.value);
	const object = OBJECTS[state.object];
	event.target.style.setProperty('--range', `${((state.area - object.area.min) / (object.area.max - object.area.min)) * 100}%`);
	event.target.previousElementSibling.querySelector('strong').textContent = `${state.area} м²`;
	const summary = stage.querySelector('.dc-step-nav > span');
	if (summary) summary.textContent = `${object.label} · ${state.area} м²`;
	clearTimeout(areaSaveTimer);
	areaSaveTimer = setTimeout(saveState, 140);
}

function handleKeydown(event) {
	if (!shell.classList.contains('is-open')) return;
	if (event.key === 'Escape') {
		event.preventDefault();
		return closeConfigurator();
	}
	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && state.step === 3) {
		event.preventDefault();
		return undoDecision();
	}
	if (state.step === 3 && !detailsId && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
		if (event.key === 'ArrowLeft') { event.preventDefault(); return animateDecision('no'); }
		if (event.key === 'ArrowRight') { event.preventDefault(); return animateDecision('yes'); }
		if (event.key === 'Enter' && currentScenario()) { event.preventDefault(); return openDetails(currentScenario().id); }
	}
	if (event.key === 'Tab') {
		const focusRoot = shell.querySelector('.dc-modal') || shell;
		const focusable = [...focusRoot.querySelectorAll('button:not([disabled]), a[href], input:not([disabled])')].filter((item) => item.offsetParent !== null);
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}
}

ui.addEventListener('click', handleClick);
	ui.addEventListener('input', handleInput);
	ui.addEventListener('keydown', handleKeydown);
updateLauncher();
	updateProgress();
