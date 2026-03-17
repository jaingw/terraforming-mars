<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :disabled="disabled"
    :class="buttonClass"
    class="tfm-button"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </component>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TfmButton',
  props: {
    variant: {
      type: String,
      default: 'outline',
      validator: (v: string) => ['primary', 'outline', 'ghost', 'danger', 'teal', 'cyan'].includes(v),
    },
    size: {
      type: String,
      default: 'md',
      validator: (v: string) => ['sm', 'md', 'lg'].includes(v),
    },
    block: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    href: {
      type: String,
      default: '',
    },
  },
  computed: {
    buttonClass(): Record<string, boolean> {
      return {
        [`tfm-button--${this.variant}`]: true,
        [`tfm-button--${this.size}`]: true,
        'tfm-button--block': this.block,
        'tfm-button--disabled': this.disabled,
      };
    },
  },
});
</script>

<style scoped>
.tfm-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  white-space: nowrap;
  font-family: inherit;
}

/* ===== Sizes ===== */
.tfm-button--sm {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 2px;
}

.tfm-button--md {
  padding: 7px 16px;
  font-size: 12px;
  border-radius: 2px;
}

.tfm-button--lg {
  padding: 10px 24px;
  font-size: 13px;
  border-radius: 3px;
}

/* ===== Block ===== */
.tfm-button--block {
  display: flex;
  width: 100%;
}

/* ===== Disabled ===== */
.tfm-button--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ===== Variant: Primary ===== */
.tfm-button--primary {
  background: linear-gradient(135deg, #e2520e, #f97316);
  color: #fff;
  box-shadow: 0 0 14px rgba(226, 82, 14, 0.25);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
}
.tfm-button--primary:hover {
  box-shadow: 0 0 22px rgba(226, 82, 14, 0.4);
  background: linear-gradient(135deg, #f97316, #f59e0b);
}

/* ===== Variant: Outline ===== */
.tfm-button--outline {
  background: rgba(17, 26, 46, 0.8);
  border: 1px solid rgba(38, 48, 80, 0.8);
  color: #cbd5e1;
}
.tfm-button--outline:hover {
  background: rgba(226, 82, 14, 0.1);
  border-color: rgba(226, 82, 14, 0.4);
  color: #f1f5f9;
}

/* ===== Variant: Ghost ===== */
.tfm-button--ghost {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
}
.tfm-button--ghost:hover {
  background: rgba(26, 37, 64, 0.6);
  color: #f1f5f9;
}

/* ===== Variant: Danger ===== */
.tfm-button--danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.tfm-button--danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #f87171;
}

/* ===== Variant: Teal ===== */
.tfm-button--teal {
  background: rgba(45, 212, 191, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.4);
  color: #2dd4bf;
}
.tfm-button--teal:hover {
  background: rgba(45, 212, 191, 0.18);
  border-color: rgba(45, 212, 191, 0.6);
  box-shadow: 0 0 14px rgba(45, 212, 191, 0.15);
}

/* ===== Variant: Cyan ===== */
.tfm-button--cyan {
  background: transparent;
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: #22d3ee;
}
.tfm-button--cyan:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.15);
}
</style>
