import Button from "@/components/core/Input/Button";

import TimerCard from "@/components/TimerCard";
import NewTimerCard from "@/components/NewTimerCard";

import TextInput from "@/components/core/Input/TextInput";
import TimeInput from "@/components/core/Input/TimeInput";

import Modal from "@/components/Modal";
import useTimer from "@/hooks/useTimer";

import { For } from "solid-js";

export default function TimerGallery() {

  const { modalOpen, setModalOpen, newTimerModalOpen, setNewTimerModalOpen, editTimerModalOpen, setEditTimerModalOpen, newTimerTitle, setNewTimerTitle, newTimerDuration, setNewTimerDuration, editTimerTitle, setEditTimerTitle, editTimerDuration, setEditTimerDuration, timers, saveTimer, saveEditTimer, deleteTimer, openEditModal } = useTimer();

  return (
    <>
      <Modal show={modalOpen()} onClose={() => setModalOpen(false)} />

      <Modal show={newTimerModalOpen()} onClose={() => setNewTimerModalOpen(false)}>

        <div class="flex flex-col gap-2 mt-2 w-60">

          <h1 class="text-2xl font-bold mb-4">New Timer</h1>

          <label for="timer-title">Title</label>
          <TextInput id="timer-title" placeholder="Timer Title" class="mb-4 p-2 center border border-primary-light-3 rounded w-full" value={newTimerTitle()} onChange={setNewTimerTitle} />

          <label for="timer-duration">Duration</label>
          <TimeInput id="timer-duration" class="mb-4 p-2 border border-primary-light-3 rounded w-full" value={newTimerDuration()} onChange={setNewTimerDuration} />

        </div>

        <div class="grid grid-cols-2 w-full justify-stretch items-start gap-2 mt-8">
          <Button
            variant="basic"
            class="w-full text-center"
            onClick={() => setNewTimerModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            class="w-full text-center"
            onClick={saveTimer}>
            Save
          </Button>
        </div>

      </Modal>

      <Modal show={editTimerModalOpen()} onClose={() => setEditTimerModalOpen(false)}>

        <div class="flex flex-col gap-2 mt-2 w-60">

          <h1 class="text-2xl font-bold mb-4">Edit Timer</h1>

          <label for="edit-timer-title">Title</label>
          <TextInput id="edit-timer-title" placeholder="Timer Title" class="mb-4 p-2 center border border-primary-light-3 rounded w-full" value={editTimerTitle()} onChange={setEditTimerTitle} />

          <label for="edit-timer-duration">Duration</label>
          <TimeInput id="edit-timer-duration" class="mb-4 p-2 border border-primary-light-3 rounded w-full" value={editTimerDuration()} onChange={setEditTimerDuration} />

        </div>

        <div class="grid grid-cols-2 w-full justify-stretch items-start gap-2 mt-8">
          <Button
            variant="basic"
            class="w-full text-center"
            onClick={() => setEditTimerModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            class="w-full text-center"
            onClick={saveEditTimer}>
            Save
          </Button>
        </div>

      </Modal>

      <section class="full grid grid-cols-6 grid-rows-6 content-center gap-8 py-40 px-20">

        <For each={timers()}>
          {(timer) => <TimerCard id={timer?.id || 0} duration={timer?.duration || 0} title={timer?.title || ""} onEdit={() => openEditModal(timer)} onDelete={() => deleteTimer(timer.id)} />}
        </For>

        <NewTimerCard onClick={() => setNewTimerModalOpen(true)} />

      </section>

    </>
  );
};
